import { useState, useEffect, useRef } from 'react';
import { Question } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { usePreferences } from '@/context/PreferencesContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  SkipForward, 
  Rewind, 
  ArrowRight, 
  ArrowLeft, 
  Volume2,
  VolumeX,
  Send,
  Check,
  Play,
  Pause,
  X,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface QuizReaderProps {
  question: Question;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onReset: () => void;
  onScoreChange: (score: number) => void;
  currentScore: number;
}

export default function QuizReader({
  question,
  onNext,
  onPrevious,
  onSkip,
  onReset,
  onScoreChange,
  currentScore
}: QuizReaderProps) {
  const { preferences } = usePreferences();
  const { toast } = useToast();

  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBuzzed, setIsBuzzed] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [buzzTimer, setBuzzTimer] = useState(5); // Default fallback value
  const [buzzTimerActive, setBuzzTimerActive] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState<'correct' | 'incorrect' | null>(null);
  const [isFullQuestion, setIsFullQuestion] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(5); // Default fallback value
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const buzzIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize reading speed from preferences
  useEffect(() => {
    setReadingSpeed(preferences.readingSpeed);
  }, [preferences.readingSpeed]);
  
  // Initialize speech synthesis voices
  useEffect(() => {
    if (window.speechSynthesis) {
      // Load available voices
      const loadVoices = () => {
        // Get the voices and log them for debugging
        const voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices.length);
      };
      
      // Chrome requires this listener for voices to load
      speechSynthesis.onvoiceschanged = loadVoices;
      
      // Try to load initially as well
      loadVoices();
      
      // Force speech synthesis to be usable on page load
      // This fixes browser quirks where speech synthesis needs 
      // to be "warmed up" with a silent utterance
      const silentUtterance = new SpeechSynthesisUtterance('');
      silentUtterance.volume = 0;
      window.speechSynthesis.speak(silentUtterance);
      
      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);
  
  // Update buzz timer when timeout preference changes
  useEffect(() => {
    if (!buzzTimerActive) {
      setBuzzTimer(preferences.buzzTimeout);
    }
  }, [preferences.buzzTimeout, buzzTimerActive]);

  // Don't auto-start reading when component mounts
  // We'll use a start button instead

  // Clean up intervals and speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (buzzIntervalRef.current) clearInterval(buzzIntervalRef.current);
      stopSpeech();
    };
  }, []);

  // Reset state and start reading when question changes
  useEffect(() => {
    resetReading();
    startReading(); // Auto-start reading when the question changes
  }, [question]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't respond to key events while in an input element
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const { keybindings } = preferences;
      
      if (e.key === keybindings.buzzIn || e.code === keybindings.buzzIn) {
        e.preventDefault();
        if (isReading && !isBuzzed) {
          handleBuzz();
        } else if (isBuzzed && showAnswer) {
          // If answer is shown, pressing buzz key acts as "next"
          handleNext();
        }
      } else if (e.key === keybindings.nextQuestion || e.code === keybindings.nextQuestion) {
        e.preventDefault();
        handleNext();
      } else if (e.key === keybindings.prevQuestion || e.code === keybindings.prevQuestion) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === keybindings.skipQuestion || e.code === keybindings.skipQuestion) {
        e.preventDefault();
        handleSkip();
      } else if (e.key === keybindings.resetQuestion || e.code === keybindings.resetQuestion) {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isReading, isBuzzed, showAnswer, preferences.keybindings]);

  // Focus input when buzzing in
  useEffect(() => {
    if (isBuzzed && !showAnswer && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isBuzzed, showAnswer]);

  // Start buzz timer when question is fully read
  useEffect(() => {
    if (isFullQuestion && !isBuzzed && !showAnswer) {
      // Auto-buzz when question is fully read
      handleBuzz();
    }
  }, [isFullQuestion]);

  const startReading = () => {
    if (isReading || isBuzzed) return;
    
    setIsReading(true);
    setDisplayedText('');
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsFullQuestion(false);
    
    // Calculate speed based on reading speed (1-10 scale)
    // Lower numbers mean slower reading (more delay between characters)
    const charDelay = 100 - (readingSpeed * 8); // maps 1-10 to ~90-20ms
    
    // Configure text-to-speech if enabled
    if (textToSpeechEnabled) {
      speakQuestion();
    }
    
    // This stores the last chunk size we spoke, to avoid repeating small chunks
    let lastSpeakIndex = 0;
    const minSpeakChunkSize = 20; // Minimum characters to speak at once for natural speech
    
    // Start the progressive reading
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        if (newIndex <= question.text.length) {
          const newDisplayedText = question.text.substring(0, newIndex);
          setDisplayedText(newDisplayedText);
          setReadProgress(Math.floor((newIndex / question.text.length) * 100));
          
          // Synchronize text-to-speech with the displayed text
          if (textToSpeechEnabled && window.speechSynthesis && speechSynthesisRef.current) {
            // Only speak when we have a reasonable chunk size to avoid choppy speech
            // or when we're at the end of the text
            if (newIndex - lastSpeakIndex >= minSpeakChunkSize || newIndex === question.text.length) {
              // Cancel any current speech
              window.speechSynthesis.cancel();
              
              // Get the next chunk to speak
              const textToSpeak = question.text.substring(lastSpeakIndex, newIndex);
              
              // Create a new utterance for this chunk
              const utterance = new SpeechSynthesisUtterance(textToSpeak);
              utterance.rate = readingSpeed / 5; // Maps 1-10 to 0.2-2.0 speech rate
              
              // Update our reference and speak
              speechSynthesisRef.current = utterance;
              window.speechSynthesis.speak(utterance);
              
              // Update the last speak index
              lastSpeakIndex = newIndex;
            }
          }
          
          return newIndex;
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsFullQuestion(true);
          return prevIndex;
        }
      });
    }, charDelay);
  };

  const stopReading = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsReading(false);
  };

  const handleBuzz = () => {
    if ((!isReading && !isFullQuestion) || isBuzzed) return;
    
    stopReading();
    setIsBuzzed(true);
    setBuzzTimerActive(true);
    setBuzzTimer(preferences.buzzTimeout);
    setUserAnswer('');
    setAnswerResult(null);
    
    // Start buzz countdown timer
    buzzIntervalRef.current = setInterval(() => {
      setBuzzTimer(prevTime => {
        if (prevTime <= 1) {
          if (buzzIntervalRef.current) clearInterval(buzzIntervalRef.current);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Function to check if answers are similar enough to be correct
  const isAnswerCorrect = (userAnswer: string, correctAnswer: string): boolean => {
    // Convert both to lowercase and trim whitespace
    const userClean = userAnswer.toLowerCase().trim();
    const correctClean = correctAnswer.toLowerCase().trim();
    
    // Exact match
    if (userClean === correctClean) return true;
    
    // Check if user answer is a substring of correct answer or vice versa
    if (correctClean.includes(userClean) || userClean.includes(correctClean)) return true;
    
    // Remove punctuation and extra spaces for both answers
    const userNoPunct = userClean.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");
    const correctNoPunct = correctClean.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");
    
    // Check again with punctuation removed
    if (userNoPunct === correctNoPunct) return true;

    // Calculate word overlap (if both have multiple words)
    const userWords = userNoPunct.split(' ').filter(w => w.length > 2);
    const correctWords = correctNoPunct.split(' ').filter(w => w.length > 2);
    
    if (userWords.length > 1 && correctWords.length > 1) {
      const matching = userWords.filter(word => correctWords.includes(word)).length;
      const coverage = matching / Math.max(userWords.length, correctWords.length);
      
      // If more than 75% of words match, consider it correct
      if (coverage >= 0.75) return true;
    }
    
    return false;
  };

  const handleSubmitAnswer = () => {
    if (!isBuzzed || showAnswer) return;
    
    if (buzzIntervalRef.current) {
      clearInterval(buzzIntervalRef.current);
      buzzIntervalRef.current = null;
    }
    
    setBuzzTimerActive(false);

    // Check if answer is correct using fuzzy matching
    const isCorrect = isAnswerCorrect(userAnswer, question.answer);
    
    if (isCorrect) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  const handleManualCorrect = () => {
    if (answerResult === 'correct') return; // Already marked correct
    
    setAnswerResult('correct');
    onScoreChange(currentScore + 1);
    
    toast({
      title: "Marked as Correct",
      description: "You earned 1 point.",
      variant: "default",
    });
  };

  const handleManualIncorrect = () => {
    if (answerResult === 'incorrect') return; // Already marked incorrect
    
    // If previously marked correct, deduct the point
    if (answerResult === 'correct') {
      onScoreChange(currentScore - 1);
    }
    
    setAnswerResult('incorrect');
    
    toast({
      title: "Marked as Incorrect",
      description: "No points awarded.",
      variant: "destructive",
    });
  };

  const handleCorrect = () => {
    setAnswerResult('correct');
    setShowAnswer(true);
    onScoreChange(currentScore + 1);
    
    toast({
      title: "Correct Answer!",
      description: "You earned 1 point.",
      variant: "default",
    });
  };

  const handleIncorrect = () => {
    setAnswerResult('incorrect');
    setShowAnswer(true);
    
    toast({
      title: "Incorrect Answer",
      description: "No points awarded.",
      variant: "destructive",
    });
  };

  const handleTimeUp = () => {
    setBuzzTimerActive(false);
    setShowAnswer(true);
    setAnswerResult('incorrect');
    
    toast({
      title: "Time's Up!",
      description: "No points awarded.",
      variant: "destructive",
    });
  };

  const handleSkip = () => {
    resetReading();
    setShowAnswer(true);
    onSkip();
  };

  const handleNext = () => {
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const handleReset = () => {
    resetReading();
    onReset();
  };

  const pauseReading = () => {
    if (!isReading || isPaused) return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPaused(true);
    setIsReading(false);
    
    // Pause speech if text-to-speech is enabled
    if (textToSpeechEnabled && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    
    toast({
      title: "Reading Paused",
      description: "Click Resume to continue reading",
      variant: "default",
    });
  };
  
  const resumeReading = () => {
    if (!isPaused) return;
    
    setIsPaused(false);
    setIsReading(true);
    
    // Calculate speed based on reading speed
    const charDelay = 100 - (readingSpeed * 8);
    
    // For resuming speech, we'll start a new utterance at the current position
    if (textToSpeechEnabled) {
      // Create a speech utterance for the remaining text
      const remainingText = question.text.substring(currentIndex);
      const utterance = new SpeechSynthesisUtterance(remainingText);
      utterance.rate = readingSpeed / 5; // Maps 1-10 to 0.2-2.0 speech rate
      
      // Store the utterance
      speechSynthesisRef.current = utterance;
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
    }
    
    // This stores the last chunk size we spoke, to avoid repeating small chunks
    let lastSpeakIndex = currentIndex;
    const minSpeakChunkSize = 20; // Minimum characters to speak at once for natural speech
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        if (newIndex <= question.text.length) {
          const newDisplayedText = question.text.substring(0, newIndex);
          setDisplayedText(newDisplayedText);
          setReadProgress(Math.floor((newIndex / question.text.length) * 100));
          
          // Synchronize text-to-speech with the displayed text
          if (textToSpeechEnabled && window.speechSynthesis && speechSynthesisRef.current) {
            // Only speak when we have a reasonable chunk size to avoid choppy speech
            // or when we're at the end of the text
            if (newIndex - lastSpeakIndex >= minSpeakChunkSize || newIndex === question.text.length) {
              // Cancel any current speech
              window.speechSynthesis.cancel();
              
              // Get the next chunk to speak
              const textToSpeak = question.text.substring(lastSpeakIndex, newIndex);
              
              // Create a new utterance for this chunk
              const utterance = new SpeechSynthesisUtterance(textToSpeak);
              utterance.rate = readingSpeed / 5; // Maps 1-10 to 0.2-2.0 speech rate
              
              // Update our reference and speak
              speechSynthesisRef.current = utterance;
              window.speechSynthesis.speak(utterance);
              
              // Update the last speak index
              lastSpeakIndex = newIndex;
            }
          }
          
          return newIndex;
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsFullQuestion(true);
          return prevIndex;
        }
      });
    }, charDelay);
    
    toast({
      title: "Reading Resumed",
      description: "Continuing where you left off",
      variant: "default",
    });
  };

  // Text-to-speech functionality
  const stopSpeech = () => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    speechSynthesisRef.current = null;
  };
  
  const speakQuestion = () => {
    if (!textToSpeechEnabled || !window.speechSynthesis) return;
    
    // Cancel any previous speech
    stopSpeech();
    
    // We'll speak the text progressively to match the reading speed
    // Calculate character delay that matches visual display rate
    const charDelay = 100 - (readingSpeed * 8); // maps 1-10 to ~90-20ms
    
    // Create a new speech utterance with the first chunk of text
    // We'll use a smaller initial chunk to start speaking immediately
    const initialChunk = question.text.substring(0, 20);
    const utterance = new SpeechSynthesisUtterance(initialChunk);
    
    // Calculate speech rate to match character display rate
    // The speech rate needs to be precisely calibrated to match the visual reading speed
    const totalChars = question.text.length;
    const totalReadingTimeMs = totalChars * charDelay;
    
    // Standard speech time is roughly 1000ms per 5-7 words (~25-35 chars)
    // We'll adjust based on the calculated total reading time
    const averageCharsPerSecond = (totalChars / (totalReadingTimeMs / 1000));
    
    // Base rate is 1.0, adjust it according to our reading speed
    utterance.rate = readingSpeed / 5; // Maps 1-10 to 0.2-2.0 speech rate
    
    // Make sure a voice is selected - use the default system voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices[0];
    }
    
    // Store the utterance in the ref so we can cancel it later
    speechSynthesisRef.current = utterance;
    
    // Force the speechSynthesis to speak
    window.speechSynthesis.speak(utterance);
    
    // Instead of speaking all at once, the text is revealed progressively
    // and spoken in sync with the visual display
    // The main interval in startReading() handles this synchronization
  };
  
  const toggleTextToSpeech = () => {
    // Toggle text-to-speech
    const newValue = !textToSpeechEnabled;
    setTextToSpeechEnabled(newValue);
    
    if (!newValue) {
      // If turning off, stop any current speech
      stopSpeech();
    } else if (isReading) {
      // If turning on while reading, start speaking
      speakQuestion();
    }
    
    toast({
      title: newValue ? "Text-to-Speech Enabled" : "Text-to-Speech Disabled",
      description: newValue ? "Questions will be read aloud" : "Questions will not be read aloud",
      variant: "default",
    });
  };

  const resetReading = () => {
    stopReading();
    stopSpeech();
    setDisplayedText('');
    setCurrentIndex(0);
    setIsBuzzed(false);
    setShowAnswer(false);
    setBuzzTimerActive(false);
    setReadProgress(0);
    setUserAnswer('');
    setAnswerResult(null);
    setIsFullQuestion(false);
    setIsPaused(false);
    
    if (buzzIntervalRef.current) {
      clearInterval(buzzIntervalRef.current);
      buzzIntervalRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  const handleReadingSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setReadingSpeed(newSpeed);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">
            {question.subject.charAt(0).toUpperCase() + question.subject.slice(1)} Question
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{question.year}</Badge>
            <Badge variant="secondary">{question.difficulty}</Badge>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Reading Speed:</span>
            <div className="w-[120px]">
              <Slider 
                value={[readingSpeed]} 
                min={1} 
                max={10} 
                step={1} 
                onValueChange={handleReadingSpeedChange} 
              />
            </div>
            <span className="text-sm font-medium">{readingSpeed}/10</span>
            
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleTextToSpeech} 
                className="flex items-center"
              >
                {textToSpeechEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                {textToSpeechEnabled ? "Audio On" : "Audio Off"}
              </Button>
            </div>
          </div>
          <div className="text-xl font-semibold">
            Score: {currentScore}
          </div>
        </div>
        <Progress value={readProgress} className="h-1" />
      </CardHeader>
      
      <CardContent className="min-h-[300px] flex flex-col justify-between">
        <div className="prose dark:prose-invert max-w-none mb-6">
          {displayedText || (!isReading && !isPaused && currentIndex === 0 ? 'Click START to begin reading the question' : question.text)}
        </div>
        
        {isBuzzed && buzzTimerActive && (
          <div className="space-y-4">
            <div className="text-center py-2 border border-primary rounded-md bg-primary/10">
              <span className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-2xl font-bold">{buzzTimer}</span> seconds to answer
              </span>
            </div>
            
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Type your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSubmitAnswer}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {showAnswer && (
          <div className={`mt-4 p-4 rounded-md ${
            answerResult === 'correct' ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-900' : 
            answerResult === 'incorrect' ? 'bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900' : 
            'bg-muted'
          }`}>
            <div className="space-y-4">
              {/* Show full question text when answered wrong or time expired */}
              {answerResult === 'incorrect' && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Full Question:</h3>
                  <p>{question.text}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Answer:</h3>
                <p>{question.answer}</p>
              </div>
              
              {answerResult && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Your Answer:</h3>
                  <p>{userAnswer || "(No answer provided)"}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant={answerResult === 'correct' ? "default" : "outline"} 
                  size="sm"
                  onClick={handleManualCorrect}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" /> I Was Right
                </Button>
                
                <Button 
                  variant={answerResult === 'incorrect' ? "default" : "outline"} 
                  size="sm"
                  onClick={handleManualIncorrect}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" /> I Was Wrong
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrevious}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous Question
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <Rewind className="h-4 w-4 mr-1" /> Reset
          </Button>
        </div>
        
        <div className="flex gap-2">
          {/* Start Reading Button */}
          {!isReading && !isPaused && !isBuzzed && !showAnswer && !isFullQuestion && (
            <Button variant="default" onClick={startReading}>
              <Play className="h-4 w-4 mr-1" /> Start
            </Button>
          )}
          
          {/* Pause Button - Show when reading */}
          {isReading && !isBuzzed && !showAnswer && (
            <Button variant="outline" onClick={pauseReading}>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
          )}
          
          {/* Resume Button - Show when paused */}
          {!isReading && isPaused && !isBuzzed && !showAnswer && (
            <Button variant="default" onClick={resumeReading}>
              <Play className="h-4 w-4 mr-1" /> Resume
            </Button>
          )}
          
          {/* Buzz in Button */}
          {!isBuzzed && (isReading || isFullQuestion) && (
            <Button variant="default" onClick={handleBuzz}>Buzz In</Button>
          )}
          
          {/* Skip Button */}
          {!isReading && !isBuzzed && !showAnswer && !isFullQuestion && (
            <Button variant="outline" onClick={handleSkip}>
              <SkipForward className="h-4 w-4 mr-1" /> Skip
            </Button>
          )}
          
          {/* Next Button */}
          <Button 
            variant={showAnswer ? "default" : "outline"} 
            onClick={handleNext}
          >
            Next Question <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}