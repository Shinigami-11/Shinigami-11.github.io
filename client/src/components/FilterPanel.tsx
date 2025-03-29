import React from 'react';
import { useQuiz } from '@/context/QuizContext';
import { QuestionFilter, QuizDifficulty, QuizSubject } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface FilterPanelProps {
  onAddQuestionClick: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onAddQuestionClick }) => {
  const { applyFilters, filters } = useQuiz();
  const [localFilters, setLocalFilters] = React.useState<QuestionFilter>(filters);

  // Years array from 2017 to 2025
  const years = Array.from({ length: 9 }, (_, i) => (2025 - i).toString());

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    filterType: keyof QuestionFilter
  ) => {
    setLocalFilters({
      ...localFilters,
      [filterType]: e.target.value,
    });
  };

  const handleApplyFilters = () => {
    applyFilters(localFilters);
  };

  return (
    <div className="lg:w-1/4 space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <h2 className="text-xl font-heading font-semibold text-neutral-darkest border-b pb-2">
          Filter Questions
        </h2>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-semibold text-neutral-dark mb-2">
            Difficulty
          </label>
          <select
            className="w-full p-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            value={localFilters.difficulty}
            onChange={(e) => handleFilterChange(e, 'difficulty')}
          >
            <option value="all">All Difficulties</option>
            <option value={QuizDifficulty.DISTRICT}>District</option>
            <option value={QuizDifficulty.REGIONAL}>Regional</option>
            <option value={QuizDifficulty.STATE}>State</option>
          </select>
        </div>

        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-semibold text-neutral-dark mb-2">
            Subject
          </label>
          <select
            className="w-full p-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            value={localFilters.subject}
            onChange={(e) => handleFilterChange(e, 'subject')}
          >
            <option value="all">All Subjects</option>
            <option value={QuizSubject.MATH}>Math</option>
            <option value={QuizSubject.SCIENCE}>Science</option>
            <option value={QuizSubject.ARTS}>Arts and Humanities</option>
            <option value={QuizSubject.SOCIAL}>Social Studies</option>
            <option value={QuizSubject.LANGUAGE}>Language Arts</option>
          </select>
        </div>

        {/* Year Selection */}
        <div>
          <label className="block text-sm font-semibold text-neutral-dark mb-2">
            Year
          </label>
          <select
            className="w-full p-2 border border-neutral-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            value={localFilters.year}
            onChange={(e) => handleFilterChange(e, 'year')}
          >
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <Button
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors font-semibold"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-heading font-semibold text-neutral-darkest border-b pb-2 mb-4">
          Add Question
        </h2>
        <Button
          className="w-full bg-secondary text-white py-2 rounded-lg hover:bg-secondary-dark transition-colors font-semibold flex justify-center items-center"
          onClick={onAddQuestionClick}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add New Question
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
