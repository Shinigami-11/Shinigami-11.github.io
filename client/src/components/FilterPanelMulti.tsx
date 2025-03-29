import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings, Filter, X, ChevronUp, ChevronDown, FileText } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useQuiz } from '@/context/QuizContext';
import { 
  YEARS,
  SUBJECTS,
  DIFFICULTIES,
  SUBJECTS_MAP,
  DIFFICULTY_MAP,
} from '@/lib/constants';
import { QuestionFilter, QuizDifficulty, QuizSubject } from '@shared/schema';
import BatchImportModal from './BatchImportModal';

interface FilterPanelMultiProps {
  onAddQuestionClick: () => void;
  onSettingsClick: () => void;
}

export default function FilterPanelMulti({ 
  onAddQuestionClick,
  onSettingsClick 
}: FilterPanelMultiProps) {
  const { filters, applyFilters } = useQuiz();
  const [showBatchImportModal, setShowBatchImportModal] = useState(false);
  
  // Use the values from the enums for our state
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  
  const [allDifficulties, setAllDifficulties] = useState(true);
  const [allSubjects, setAllSubjects] = useState(true);
  const [allYears, setAllYears] = useState(true);

  // Collapsible sections state
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(true);
  const [isSubjectOpen, setIsSubjectOpen] = useState(true);
  const [isYearOpen, setIsYearOpen] = useState(true);
  
  // Initialize selected values from filters
  useEffect(() => {
    const initializeFilters = () => {
      if (filters.difficulties) {
        setSelectedDifficulties(filters.difficulties);
        setAllDifficulties(filters.difficulties.length === 0);
      }
      
      if (filters.subjects) {
        setSelectedSubjects(filters.subjects);
        setAllSubjects(filters.subjects.length === 0);
      }
      
      if (filters.years) {
        setSelectedYears(filters.years);
        setAllYears(filters.years.length === 0);
      }
    };
    
    initializeFilters();
  }, [filters]);
  
  const toggleDifficulty = (difficulty: string) => {
    if (selectedDifficulties.includes(difficulty)) {
      setSelectedDifficulties(selectedDifficulties.filter(d => d !== difficulty));
    } else {
      setSelectedDifficulties([...selectedDifficulties, difficulty]);
    }
    setAllDifficulties(false);
  };
  
  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
    setAllSubjects(false);
  };
  
  const toggleYear = (year: string) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
    setAllYears(false);
  };
  
  const toggleAllDifficulties = () => {
    if (!allDifficulties) {
      setSelectedDifficulties([]);
    }
    setAllDifficulties(!allDifficulties);
  };
  
  const toggleAllSubjects = () => {
    if (!allSubjects) {
      setSelectedSubjects([]);
    }
    setAllSubjects(!allSubjects);
  };
  
  const toggleAllYears = () => {
    if (!allYears) {
      setSelectedYears([]);
    }
    setAllYears(!allYears);
  };
  
  const handleApplyFilters = () => {
    // Cast to the correct enum types
    const newFilters: QuestionFilter = {
      difficulties: selectedDifficulties as any,
      subjects: selectedSubjects as any,
      years: selectedYears,
      allDifficulties,
      allSubjects,
      allYears,
    };
    applyFilters(newFilters);
  };
  
  const getSelectedCount = () => {
    return {
      difficulties: allDifficulties ? 'All' : selectedDifficulties.length,
      subjects: allSubjects ? 'All' : selectedSubjects.length,
      years: allYears ? 'All' : selectedYears.length,
    };
  };
  
  const selectedCount = getSelectedCount();
  
  return (
    <Card className="max-w-sm w-full">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Filters</CardTitle>
        </div>
        <CardDescription>
          Filter questions by difficulty, subject, and year
        </CardDescription>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline">
            Difficulties: {selectedCount.difficulties}
          </Badge>
          <Badge variant="outline">
            Subjects: {selectedCount.subjects}
          </Badge>
          <Badge variant="outline">
            Years: {selectedCount.years}
          </Badge>
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-4">
        <ScrollArea className="h-[350px] pr-3">
          <div className="space-y-4">
            {/* Difficulty Section */}
            <Collapsible open={isDifficultyOpen} onOpenChange={setIsDifficultyOpen} className="border rounded-md">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-3 font-medium">
                <div className="flex items-center">
                  <span>Difficulty Level</span>
                  <Badge variant="outline" className="ml-2">
                    {selectedCount.difficulties}
                  </Badge>
                </div>
                {isDifficultyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 pt-0">
                <Separator className="my-2" />
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id="all-difficulties" 
                    checked={allDifficulties}
                    onCheckedChange={toggleAllDifficulties}
                  />
                  <Label 
                    htmlFor="all-difficulties"
                    className="text-sm font-medium cursor-pointer"
                  >
                    All Difficulties
                  </Label>
                </div>
                
                <div className="grid grid-cols-1 gap-2 pl-6">
                  {DIFFICULTIES.map(difficulty => (
                    <div key={difficulty} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`difficulty-${difficulty}`}
                        checked={selectedDifficulties.includes(difficulty) && !allDifficulties}
                        disabled={allDifficulties}
                        onCheckedChange={() => toggleDifficulty(difficulty)}
                      />
                      <Label 
                        htmlFor={`difficulty-${difficulty}`}
                        className="cursor-pointer"
                      >
                        {DIFFICULTY_MAP[difficulty]}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {/* Subject Section */}
            <Collapsible open={isSubjectOpen} onOpenChange={setIsSubjectOpen} className="border rounded-md">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-3 font-medium">
                <div className="flex items-center">
                  <span>Subject</span>
                  <Badge variant="outline" className="ml-2">
                    {selectedCount.subjects}
                  </Badge>
                </div>
                {isSubjectOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 pt-0">
                <Separator className="my-2" />
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id="all-subjects" 
                    checked={allSubjects}
                    onCheckedChange={toggleAllSubjects}
                  />
                  <Label 
                    htmlFor="all-subjects"
                    className="text-sm font-medium cursor-pointer"
                  >
                    All Subjects
                  </Label>
                </div>
                
                <div className="grid grid-cols-1 gap-2 pl-6">
                  {SUBJECTS.map(subject => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`subject-${subject}`}
                        checked={selectedSubjects.includes(subject) && !allSubjects}
                        disabled={allSubjects}
                        onCheckedChange={() => toggleSubject(subject)}
                      />
                      <Label 
                        htmlFor={`subject-${subject}`}
                        className="cursor-pointer"
                      >
                        {SUBJECTS_MAP[subject]}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {/* Year Section */}
            <Collapsible open={isYearOpen} onOpenChange={setIsYearOpen} className="border rounded-md">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-3 font-medium">
                <div className="flex items-center">
                  <span>Year</span>
                  <Badge variant="outline" className="ml-2">
                    {selectedCount.years}
                  </Badge>
                </div>
                {isYearOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="p-3 pt-0">
                <Separator className="my-2" />
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id="all-years" 
                    checked={allYears}
                    onCheckedChange={toggleAllYears}
                  />
                  <Label 
                    htmlFor="all-years"
                    className="text-sm font-medium cursor-pointer"
                  >
                    All Years
                  </Label>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-6">
                  {YEARS.map(year => (
                    <div key={year} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`year-${year}`}
                        checked={selectedYears.includes(year.toString()) && !allYears}
                        disabled={allYears}
                        onCheckedChange={() => toggleYear(year.toString())}
                      />
                      <Label 
                        htmlFor={`year-${year}`}
                        className="cursor-pointer"
                      >
                        {year}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="flex flex-col gap-2 p-4">
        <Button 
          className="w-full" 
          onClick={handleApplyFilters}
        >
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onAddQuestionClick}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Question
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => setShowBatchImportModal(true)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Batch Import
        </Button>

        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={onSettingsClick}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </CardFooter>
      
      {/* Batch Import Modal */}
      <BatchImportModal 
        isOpen={showBatchImportModal} 
        onClose={() => setShowBatchImportModal(false)} 
        onSuccess={() => {
          // Refresh questions after a successful import
          handleApplyFilters();
        }}
      />
    </Card>
  );
}