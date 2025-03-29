import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Question, QuestionFilters } from "@shared/schema";

interface QuizContextProps {
  questions: Question[];
  currentQuestion: Question | null;
  questionIndex: number;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  sessionId: number | null;
  filters: QuestionFilters;
  showAddQuestionModal: boolean;
  loading: boolean;
  setSessionId: (id: number) => void;
  setScore: (score: number) => void;
  setCorrectAnswers: (count: number) => void;
  setIncorrectAnswers: (count: number) => void;
  setSkippedQuestions: (count: number) => void;
  setFilters: (filters: QuestionFilters) => void;
  applyFilters: () => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setShowAddQuestionModal: (show: boolean) => void;
}

const QuizContext = createContext<QuizContextProps | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [filters, setFilters] = useState<QuestionFilters>({
    difficulty: "all",
    subject: "all",
    year: "all"
  });

  // Fetch questions with filters
  const { data, refetch, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions", filters], 
    enabled: true
  });

  // Apply filters by refetching questions
  const applyFilters = () => {
    refetch();
  };

  // Update questions when data changes
  useEffect(() => {
    if (data) {
      setQuestions(data);
      // Reset the current question index if needed
      if (questionIndex >= data.length) {
        setQuestionIndex(0);
      }
      // Set current question
      setCurrentQuestion(data.length > 0 ? data[questionIndex] : null);
    }
  }, [data, questionIndex]);

  // Navigate to next question
  const nextQuestion = () => {
    const newIndex = (questionIndex + 1) % Math.max(1, questions.length);
    setQuestionIndex(newIndex);
  };

  // Navigate to previous question
  const prevQuestion = () => {
    const newIndex = (questionIndex - 1 + questions.length) % questions.length;
    setQuestionIndex(newIndex);
  };

  const contextValue = {
    questions,
    currentQuestion,
    questionIndex,
    score,
    correctAnswers,
    incorrectAnswers,
    skippedQuestions,
    sessionId,
    filters,
    showAddQuestionModal,
    loading: isLoading,
    setSessionId,
    setScore,
    setCorrectAnswers,
    setIncorrectAnswers,
    setSkippedQuestions,
    setFilters,
    applyFilters,
    nextQuestion,
    prevQuestion,
    setShowAddQuestionModal
  };

  return (
    <QuizContext.Provider value={contextValue}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
