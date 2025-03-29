import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIFFICULTY, SUBJECT } from "@shared/schema";
import { useQuiz } from "@/lib/quiz-context";
import { Filter, Plus } from "lucide-react";

export default function QuestionFilters() {
  const { 
    filters, 
    setFilters, 
    applyFilters, 
    setShowAddQuestionModal 
  } = useQuiz();
  
  const [localFilters, setLocalFilters] = useState(filters);

  // Create arrays of years from 2017 to 2025
  const years = Array.from({ length: 9 }, (_, i) => 2025 - i);

  const handleDifficultyClick = (difficulty: string) => {
    setLocalFilters(prev => ({
      ...prev,
      difficulty
    }));
  };

  const handleSubjectChange = (value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      subject: value
    }));
  };

  const handleYearChange = (value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      year: value
    }));
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    applyFilters();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Question Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={localFilters.difficulty === "all" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => handleDifficultyClick("all")}
              >
                All
              </Button>
              <Button 
                variant={localFilters.difficulty === DIFFICULTY.DISTRICT ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => handleDifficultyClick(DIFFICULTY.DISTRICT)}
              >
                District
              </Button>
              <Button 
                variant={localFilters.difficulty === DIFFICULTY.REGIONAL ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => handleDifficultyClick(DIFFICULTY.REGIONAL)}
              >
                Regional
              </Button>
              <Button 
                variant={localFilters.difficulty === DIFFICULTY.STATE ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => handleDifficultyClick(DIFFICULTY.STATE)}
              >
                State
              </Button>
            </div>
          </div>
          
          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <Select 
              value={localFilters.subject} 
              onValueChange={handleSubjectChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value={SUBJECT.MATH}>Math</SelectItem>
                <SelectItem value={SUBJECT.SCIENCE}>Science</SelectItem>
                <SelectItem value={SUBJECT.ARTS}>Arts and Humanities</SelectItem>
                <SelectItem value={SUBJECT.SOCIAL}>Social Studies</SelectItem>
                <SelectItem value={SUBJECT.LANGUAGE}>Language Arts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <Select 
              value={localFilters.year.toString()} 
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <Button 
            variant="secondary" 
            onClick={handleApplyFilters}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowAddQuestionModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
