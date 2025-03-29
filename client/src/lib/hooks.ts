import { createContext, useContext, useState, ReactNode } from 'react';

// Create a context for quiz state
interface QuizContextType {
  score: number;
  setScore: (score: number | ((prev: number) => number)) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Provider component
export const QuizProvider = ({ children }: { children: ReactNode }) => {
  const [score, setScore] = useState(0);

  return (
    <QuizContext.Provider value={{ score, setScore }}>
      {children}
    </QuizContext.Provider>
  );
};

// Hook to use the quiz context
export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuizContext must be used within a QuizProvider');
  }
  return context;
};

// More hooks can be added as needed
