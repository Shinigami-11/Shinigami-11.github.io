import React from 'react';
import { useQuiz } from '@/context/QuizContext';
import { Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { score } = useQuiz();

  return (
    <header className="bg-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-heading font-bold">QuizParserinator</h1>
        <div className="flex items-center space-x-4">
          <span className="hidden md:inline font-mono">
            Score: <span className="font-bold text-lg">{score}</span>
          </span>
          <button 
            className="p-2 rounded-full hover:bg-primary-dark transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
