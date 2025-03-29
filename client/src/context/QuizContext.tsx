import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Question, QuestionFilter, InsertQuestion, QuizDifficulty, QuizSubject } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { usePreferences } from '@/context/PreferencesContext';
import { 
  getUserQuestions, 
  saveUserQuestion, 
  deleteUserQuestion, 
  updateUserQuestion,
  importUserQuestions
} from '@/lib/localQuestionStorage';

type QuizContextType = {
  questions: Question[];
  filteredQuestions: Question[];
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  isReading: boolean;
  isBuzzed: boolean;
  timerActive: boolean;
  timerValue: number;
  score: number;
  showAnswer: boolean;
  filters: QuestionFilter;
  isLoading: boolean;
  applyFilters: (filters: QuestionFilter) => void;
  startReading: () => void;
  buzzIn: () => void;
  skipQuestion: () => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  restartQuestion: () => void;
  updateScore: (newScore: number) => void;
  addQuestion: (question: Omit<Question, 'id'>) => Promise<Question>;
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

type QuizProviderProps = {
  children: ReactNode;
};

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const { preferences } = usePreferences();
  
  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [isBuzzed, setIsBuzzed] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerValue, setTimerValue] = useState(preferences.buzzTimeout);
  const [showAnswer, setShowAnswer] = useState(false);
  const [filters, setFilters] = useState<QuestionFilter>({
    difficulties: [],
    subjects: [],
    years: [],
    allDifficulties: true,
    allSubjects: true,
    allYears: true,
  });
  
  // Query for server questions and combine with local user questions
  const { data: serverQuestions = [], isLoading: isQuestionsLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions'],
  });
  
  // Load user questions from local storage
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  
  // Effect to load user questions from local storage
  useEffect(() => {
    const loadUserQuestions = () => {
      try {
        const localQuestions = getUserQuestions();
        setUserQuestions(localQuestions);
      } catch (error) {
        console.error('Error loading user questions from local storage:', error);
      }
    };
    
    loadUserQuestions();
    
    // Listen for storage events to update questions if localStorage changes in another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quiz_parserinator_user_questions') {
        loadUserQuestions();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Combine server and user questions
  const questions = [...serverQuestions, ...userQuestions];
  
  // Query for filtered questions
  const { data: filteredQuestions = [], isLoading: isFilteredLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions/filter', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      // Handle difficulties
      if (!filters.allDifficulties && filters.difficulties.length > 0) {
        filters.difficulties.forEach(diff => {
          queryParams.append('difficulties', diff);
        });
      }
      
      // Handle subjects
      if (!filters.allSubjects && filters.subjects.length > 0) {
        filters.subjects.forEach(subj => {
          queryParams.append('subjects', subj);
        });
      }
      
      // Handle years
      if (!filters.allYears && filters.years.length > 0) {
        filters.years.forEach(year => {
          queryParams.append('years', year);
        });
      }
      
      // Add flags for "all" selections
      queryParams.append('allDifficulties', filters.allDifficulties.toString());
      queryParams.append('allSubjects', filters.allSubjects.toString());
      queryParams.append('allYears', filters.allYears.toString());
      
      const response = await fetch(`/api/questions/filter?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch filtered questions');
      }
      return response.json();
    },
  });
  
  // Query for score
  const { data: scoreData, isLoading: isScoreLoading } = useQuery<{ score: number }>({
    queryKey: ['/api/score'],
  });
  
  // Mutation for updating score
  const updateScoreMutation = useMutation({
    mutationFn: async (newScore: number) => {
      return apiRequest('POST', '/api/score', { score: newScore });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/score'] });
    },
  });
  
  // Mutation for adding a question
  const addQuestionMutation = useMutation({
    mutationFn: async (newQuestion: Omit<Question, 'id'>) => {
      return apiRequest('POST', '/api/questions', newQuestion);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/questions/filter'] });
    },
  });
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive) {
      interval = setInterval(() => {
        setTimerValue((prev: number) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setTimerActive(false);
            setShowAnswer(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);
  
  // Current question
  const currentQuestion = filteredQuestions[currentQuestionIndex] || null;
  
  // Actions
  const applyFilters = (newFilters: QuestionFilter) => {
    setFilters(newFilters);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setIsBuzzed(false);
    setIsReading(false);
    setTimerActive(false);
    setTimerValue(preferences.buzzTimeout);
  };
  
  const startReading = () => {
    setIsReading(true);
    setIsBuzzed(false);
    setShowAnswer(false);
    setTimerActive(false);
    setTimerValue(preferences.buzzTimeout);
    
    // Simulate reading completion after 3 seconds
    setTimeout(() => {
      if (isReading) {
        setIsReading(false);
        startTimer();
      }
    }, 3000);
  };
  
  const startTimer = () => {
    setTimerActive(true);
    setTimerValue(preferences.buzzTimeout);
  };
  
  const buzzIn = () => {
    if (isBuzzed || !isReading) return;
    
    setIsReading(false);
    setIsBuzzed(true);
    startTimer();
  };
  
  const skipQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetQuestionState();
      startReading();
    } else {
      setCurrentQuestionIndex(0);
      resetQuestionState();
      startReading();
    }
  };
  
  const nextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetQuestionState();
      startReading();
    }
  };
  
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetQuestionState();
      startReading();
    }
  };
  
  const restartQuestion = () => {
    resetQuestionState();
    startReading();
  };
  
  const resetQuestionState = () => {
    setIsReading(false);
    setIsBuzzed(false);
    setTimerActive(false);
    setTimerValue(preferences.buzzTimeout);
    setShowAnswer(false);
  };
  
  const updateScore = (newScore: number) => {
    updateScoreMutation.mutate(newScore);
  };
  
  // Add user questions to local storage instead of server
  const addQuestion = async (question: Omit<Question, 'id'>) => {
    try {
      // Save the question to local storage
      const insertQuestion = question as InsertQuestion;
      const savedQuestion = saveUserQuestion(insertQuestion);
      
      // Update the questions in state to include this new question
      queryClient.setQueryData<Question[]>(['/api/questions'], (oldData = []) => {
        return [...oldData, savedQuestion];
      });
      
      // Also update the filtered questions if it matches the current filters
      const matchesFilter = (
        (filters.allDifficulties || filters.difficulties.includes(savedQuestion.difficulty)) &&
        (filters.allSubjects || filters.subjects.includes(savedQuestion.subject)) &&
        (filters.allYears || filters.years.includes(savedQuestion.year))
      );
      
      if (matchesFilter) {
        queryClient.setQueryData<Question[]>(['/api/questions/filter', filters], (oldData = []) => {
          return [...oldData, savedQuestion];
        });
      }
      
      return savedQuestion;
    } catch (error) {
      console.error('Error adding user question:', error);
      throw error;
    }
  };
  
  // Start reading when component mounts or when filtered questions change
  useEffect(() => {
    if (filteredQuestions.length > 0 && !isReading && !isBuzzed && !showAnswer) {
      startReading();
    }
  }, [filteredQuestions]);
  
  // Update timer value when preferences change
  useEffect(() => {
    if (!timerActive) {
      setTimerValue(preferences.buzzTimeout);
    }
  }, [preferences.buzzTimeout, timerActive]);
  
  const isLoading = isQuestionsLoading || isFilteredLoading || isScoreLoading;
  const score = scoreData?.score || 0;
  
  const value = {
    questions,
    filteredQuestions,
    currentQuestion,
    currentQuestionIndex,
    isReading,
    isBuzzed,
    timerActive,
    timerValue,
    score,
    showAnswer,
    filters,
    isLoading,
    applyFilters,
    startReading,
    buzzIn,
    skipQuestion,
    nextQuestion,
    prevQuestion,
    restartQuestion,
    updateScore,
    addQuestion,
  };
  
  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
