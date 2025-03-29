import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuiz } from "@/lib/quiz-context";
import { Bell, SkipForward, ArrowRight, Check, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function QuestionReader() {
  const { 
    currentQuestion, 
    nextQuestion, 
    questions, 
    questionIndex,
    sessionId,
    correctAnswers,
    incorrectAnswers,
    skippedQuestions,
    score,
    setScore,
    setCorrectAnswers,
    setIncorrectAnswers,
    setSkippedQuestions,
    loading
  } = useQuiz();
  
  const { toast } = useToast();
  const [isReading, setIsReading] = useState(true);
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(5);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const answerInputRef = useRef<HTMLInputElement>(null);
  const readingInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/sessions/${sessionId}`, data);
      return res.json();
    }
  });

  // Start reading the question
  useEffect(() => {
    if (!currentQuestion || !isReading || hasBuzzed) return;
    
    // Clear any existing interval
    if (readingInterval.current) {
      clearInterval(readingInterval.current);
    }
    
    const words = currentQuestion.questionText.split(' ');
    let wordIndex = 0;
    
    setDisplayedText("");
    
    readingInterval.current = setInterval(() => {
      if (wordIndex < words.length) {
        setDisplayedText(prev => {
          return prev + (prev ? ' ' : '') + words[wordIndex];
        });
        wordIndex++;
      } else {
        // Question finished reading
        clearInterval(readingInterval.current!);
        setIsReading(false);
        startTimer();
      }
    }, 250); // Adjust speed as needed
    
    return () => {
      if (readingInterval.current) {
        clearInterval(readingInterval.current);
      }
    };
  }, [currentQuestion, isReading, hasBuzzed]);
  
  // Handle buzz in
  const handleBuzzIn = () => {
    if (hasBuzzed || !isReading) return;
    
    // Stop reading
    if (readingInterval.current) {
      clearInterval(readingInterval.current);
    }
    
    setIsReading(false);
    setHasBuzzed(true);
    
    // Start timer
    startTimer();
    
    // Focus the answer input
    setTimeout(() => {
      if (answerInputRef.current) {
        answerInputRef.current.focus();
      }
    }, 0);
  };
  
  // Start timer
  const startTimer = () => {
    setTimeLeft(5);
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    timerInterval.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current!);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Handle time up
  const handleTimeUp = () => {
    if (!showAnswer) {
      checkAnswer();
    }
  };
  
  // Handle skip
  const handleSkip = () => {
    // Stop any intervals
    if (readingInterval.current) {
      clearInterval(readingInterval.current);
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    // Update state
    setHasBuzzed(false);
    setIsReading(false);
    setShowAnswer(true);
    setSkippedQuestions(prev => prev + 1);
    
    // Update session
    updateSessionMutation.mutate({
      skippedQuestions: skippedQuestions + 1,
    });
    
    toast({
      title: "Question skipped",
      description: "Moving to the next question",
    });
  };
  
  // Handle submit answer
  const handleSubmitAnswer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    checkAnswer();
  };
  
  // Check answer
  const checkAnswer = () => {
    if (!currentQuestion) return;
    
    const formattedUserAnswer = userAnswer.trim().toLowerCase();
    const formattedCorrectAnswer = currentQuestion.answer.toLowerCase();
    
    // Simple string matching (could be improved with more sophisticated matching)
    const correct = formattedUserAnswer.includes(formattedCorrectAnswer) || 
                   formattedCorrectAnswer.includes(formattedUserAnswer);
    
    setIsCorrect(correct);
    setShowAnswer(true);
    
    // Update stats
    if (correct) {
      const newScore = score + currentQuestion.points;
      const newCorrectAnswers = correctAnswers + 1;
      
      setScore(newScore);
      setCorrectAnswers(newCorrectAnswers);
      
      // Update session
      updateSessionMutation.mutate({
        score: newScore,
        correctAnswers: newCorrectAnswers,
      });
      
      toast({
        title: "Correct!",
        description: `+${currentQuestion.points} points`,
        variant: "default",
      });
    } else {
      const newIncorrectAnswers = incorrectAnswers + 1;
      setIncorrectAnswers(newIncorrectAnswers);
      
      // Update session
      updateSessionMutation.mutate({
        incorrectAnswers: newIncorrectAnswers,
      });
      
      toast({
        title: "Incorrect",
        description: "Better luck next time",
        variant: "destructive",
      });
    }
  };
  
  // Handle next question
  const handleNextQuestion = () => {
    // Reset state
    setIsReading(true);
    setHasBuzzed(false);
    setUserAnswer("");
    setShowAnswer(false);
    setIsCorrect(null);
    setDisplayedText("");
    
    // Stop any intervals
    if (readingInterval.current) {
      clearInterval(readingInterval.current);
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    // Go to next question
    nextQuestion();
  };
  
  // Handle keydown for space to buzz
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && isReading && !hasBuzzed) {
        e.preventDefault(); // Prevent page scroll
        handleBuzzIn();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isReading, hasBuzzed]);
  
  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (readingInterval.current) {
        clearInterval(readingInterval.current);
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);
  
  // Calculate the timer circle animation
  const timerCircleOffset = 283 * (1 - timeLeft / 5);
  
  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-8 flex justify-center items-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading questions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!currentQuestion) {
    return (
      <Card className="mb-6">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-lg text-gray-500">No questions available with the current filters.</p>
            <p className="mt-2 text-gray-400">Try changing the filters or adding new questions.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="bg-primary bg-opacity-10 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Badge variant="default">{currentQuestion.difficulty}</Badge>
          <Badge variant="secondary">{currentQuestion.subject}</Badge>
          <span className="text-sm text-gray-600">{currentQuestion.year}</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600">
            Question {questionIndex + 1}/{questions.length}
          </span>
        </div>
      </div>
      
      <CardContent className="px-6 py-8">
        {/* Question Display */}
        <div className="question-container">
          <h3 className="text-lg font-medium mb-3">Question:</h3>
          <p className="text-gray-800 text-lg leading-relaxed">
            {displayedText}
          </p>
        </div>
        
        {/* Answer Display (Hidden until buzz or question end) */}
        {showAnswer && (
          <div className="answer-container mt-6">
            <h3 className="text-lg font-medium mb-3">Answer:</h3>
            <p className="text-gray-800 font-medium">{currentQuestion.answer}</p>
            
            {hasBuzzed && (
              <div className="mt-4 flex items-center">
                <div className="flex-1">
                  <p className="text-gray-600">
                    Your response: <span className="font-medium">{userAnswer || "(No answer provided)"}</span>
                  </p>
                </div>
                {isCorrect !== null && (
                  <div>
                    {isCorrect ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Correct!
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                        <X className="w-3 h-3" /> Incorrect
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* User Input (visible after buzz) */}
        {hasBuzzed && !showAnswer && (
          <div className="mt-6">
            <div className="flex items-center">
              <div className="flex-grow">
                <Input 
                  ref={answerInputRef}
                  type="text" 
                  placeholder="Type your answer here..." 
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmitAnswer();
                    }
                  }}
                  className="w-full p-3"
                />
              </div>
              <div className="ml-3">
                {/* Timer Circle */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg width="50" height="50" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="#e0e0e0" strokeWidth="8"></circle>
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="transparent" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="8" 
                      style={{
                        strokeDasharray: 283,
                        strokeDashoffset: timerCircleOffset,
                        transform: "rotate(-90deg)",
                        transformOrigin: "50% 50%",
                        transition: "stroke-dashoffset 1s linear"
                      }}
                    ></circle>
                  </svg>
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold">
                    {timeLeft}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Button 
                className="w-full" 
                onClick={handleSubmitAnswer}
              >
                Submit Answer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-3 justify-between items-center w-full">
          <div className="flex space-x-3">
            <Button 
              onClick={handleBuzzIn}
              disabled={!isReading || hasBuzzed}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Buzz In (Space)
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSkip}
              disabled={!isReading}
              className="flex items-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleNextQuestion}
            disabled={!showAnswer && isReading}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Next Question
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
