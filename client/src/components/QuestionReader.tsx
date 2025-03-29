import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Question } from "@shared/schema";
import CircleTimer from "./CircleTimer";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

interface QuestionReaderProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  onScoreChange: (newScore: number) => void;
  onNextQuestion: () => void;
}

export default function QuestionReader({
  question,
  questionNumber,
  totalQuestions,
  score,
  onScoreChange,
  onNextQuestion,
}: QuestionReaderProps) {
  const [isReading, setIsReading] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const readingIntervalRef = useRef<number | null>(null);
  
  // Format the question title for display
  const getQuestionTitle = () => {
    const subject = question.subject.charAt(0).toUpperCase() + question.subject.slice(1);
    const difficulty = question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);
    return `${subject} - ${difficulty} (${question.year})`;
  };
  
  // Reset the reader state when the question changes
  useEffect(() => {
    setIsReading(true);
    setReadProgress(0);
    setHasBuzzed(false);
    setHasAnswered(false);
    setIsTimerRunning(false);
    
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current);
    }
    
    // Start reading the question
    startReading();
    
    return () => {
      if (readingIntervalRef.current) {
        clearInterval(readingIntervalRef.current);
      }
    };
  }, [question]);
  
  // Function to start reading the question
  const startReading = () => {
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current);
    }
    
    setIsReading(true);
    setReadProgress(0);
    
    readingIntervalRef.current = window.setInterval(() => {
      setReadProgress((prev) => {
        const newProgress = prev + 0.5;
        if (newProgress >= 100) {
          clearInterval(readingIntervalRef.current!);
          setIsReading(false);
          setIsTimerRunning(true);
          return 100;
        }
        return newProgress;
      });
    }, 50);
  };
  
  // Handle buzzing in
  const handleBuzz = () => {
    if (hasBuzzed) return;
    
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current);
    }
    
    setHasBuzzed(true);
    setIsReading(false);
    setIsTimerRunning(true);
  };
  
  // Handle timer completion
  const handleTimerComplete = () => {
    setIsTimerRunning(false);
    setHasAnswered(true);
  };
  
  // Handle skipping the question
  const handleSkip = () => {
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current);
    }
    setIsTimerRunning(false);
    setIsReading(false);
    setHasAnswered(true);
  };
  
  // Handle moving to the next question
  const handleNext = () => {
    onNextQuestion();
  };
  
  // Keyboard shortcuts
  useKeyboardShortcut("Space", handleBuzz, { disabled: hasBuzzed });
  useKeyboardShortcut("ArrowRight", hasAnswered ? handleNext : handleSkip);
  
  return (
    <div className="lg:col-span-9 bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-4 bg-primary-50 border-b border-primary-100">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-neutral-700">
              {getQuestionTitle()}
            </h3>
            <p className="text-sm text-neutral-500">
              Question {questionNumber + 1} of {totalQuestions}
            </p>
          </div>
          <div className="flex space-x-2">
            {(isTimerRunning || hasAnswered) && (
              <CircleTimer
                duration={5}
                isRunning={isTimerRunning}
                onComplete={handleTimerComplete}
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-8 min-h-[150px]">
          <div className="text-lg text-neutral-700 leading-relaxed">
            <p>{question.question}</p>
          </div>
          
          {hasAnswered && (
            <div className="mt-4 p-4 bg-neutral-50 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-primary mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                <div>
                  <span className="font-medium text-neutral-700">Answer:</span>
                  <span className="ml-1 text-neutral-700">{question.answer}</span>
                </div>
              </div>
              {question.additionalInfo && (
                <div className="mt-2 text-sm text-neutral-500">
                  <p>{question.additionalInfo}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-auto">
            <Button
              className={`buzz-button w-full sm:w-auto transition-all shadow-md flex items-center justify-center ${
                hasBuzzed
                  ? "bg-neutral-400 cursor-not-allowed hover:bg-neutral-400"
                  : "bg-secondary-500 hover:bg-secondary-700"
              }`}
              size="lg"
              onClick={handleBuzz}
              disabled={hasBuzzed}
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.1 3a1.9 1.9 0 0 0-1.6.9M7 10.5V8.9a3 3 0 0 1 .2-1.1"></path>
                <path d="m22 6-10 7h-2V6l10 7h2v-7zm-10 7v4"></path>
                <path d="M10.2 21h-.4c-1 0-1.8-.7-1.8-1.6v-5.8"></path>
              </svg>
              BUZZ IN (Space)
            </Button>
          </div>
          
          <div className="flex space-x-3 w-full sm:w-auto">
            {!hasAnswered ? (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleSkip}
              >
                Skip (→)
              </Button>
            ) : (
              <Button
                className="w-full sm:w-auto"
                onClick={handleNext}
              >
                Next (→)
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="bg-neutral-50 h-2 w-full">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${readProgress}%` }}
        ></div>
      </div>
    </div>
  );
}
