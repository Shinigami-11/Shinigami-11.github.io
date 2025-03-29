import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { useQuiz } from '@/context/QuizContext';
import QuizReader from '@/components/QuizReader';
import AddQuestionModal from '@/components/AddQuestionModal';
import SettingsDialog from '@/components/SettingsDialog';
import BatchImportModal from '@/components/BatchImportModal';
import { Check, Settings, PlusCircle, FileText, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { usePreferences } from '@/context/PreferencesContext';
import Header from '@/components/layout/header';
import { 
  YEARS,
  SUBJECTS,
  DIFFICULTIES,
  SUBJECTS_MAP,
  DIFFICULTY_MAP,
} from '@/lib/constants';
import { QuestionFilter } from '@shared/schema';

export default function Home() {
  const { 
    currentQuestion, 
    currentQuestionIndex,
    score, 
    updateScore, 
    nextQuestion, 
    prevQuestion, 
    skipQuestion, 
    restartQuestion,
    filters,
    applyFilters,
    filteredQuestions
  } = useQuiz();
  
  const { preferences, setDarkMode } = usePreferences();
  
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  
  // Filter state
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [allDifficulties, setAllDifficulties] = useState(true);
  const [allSubjects, setAllSubjects] = useState(true);
  const [allYears, setAllYears] = useState(true);
  
  // Initialize selected values from filters
  useEffect(() => {
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
  }, [filters]);
  
  const openAddQuestionModal = () => {
    setIsAddQuestionModalOpen(true);
  };
  
  const closeAddQuestionModal = () => {
    setIsAddQuestionModalOpen(false);
  };
  
  const openSettings = () => {
    setIsSettingsOpen(true);
  };
  
  const toggleBatchImport = () => {
    setIsBatchImportOpen(!isBatchImportOpen);
  };
  
  const handleScoreChange = (newScore: number) => {
    updateScore(newScore);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!preferences.darkMode);
  };
  
  const toggleDifficulty = (difficulty: string) => {
    let newDifficulties = [...selectedDifficulties];
    
    if (newDifficulties.includes(difficulty)) {
      newDifficulties = newDifficulties.filter(d => d !== difficulty);
    } else {
      newDifficulties.push(difficulty);
    }
    
    setSelectedDifficulties(newDifficulties);
    setAllDifficulties(false);
    
    // Apply filters immediately
    handleApplyFilters({
      ...filters,
      difficulties: newDifficulties as ("district" | "regional" | "state")[],
      allDifficulties: false
    });
  };
  
  const toggleSubject = (subject: string) => {
    let newSubjects = [...selectedSubjects];
    
    if (newSubjects.includes(subject)) {
      newSubjects = newSubjects.filter(s => s !== subject);
    } else {
      newSubjects.push(subject);
    }
    
    setSelectedSubjects(newSubjects);
    setAllSubjects(false);
    
    // Apply filters immediately
    handleApplyFilters({
      ...filters,
      subjects: newSubjects as ("math" | "science" | "arts" | "social" | "language")[],
      allSubjects: false
    });
  };
  
  const toggleYear = (year: string) => {
    let newYears = [...selectedYears];
    
    if (newYears.includes(year)) {
      newYears = newYears.filter(y => y !== year);
    } else {
      newYears.push(year);
    }
    
    setSelectedYears(newYears);
    setAllYears(false);
    
    // Apply filters immediately
    handleApplyFilters({
      ...filters,
      years: newYears,
      allYears: false
    });
  };
  
  const toggleAllDifficulties = () => {
    const newValue = !allDifficulties;
    setAllDifficulties(newValue);
    
    if (newValue) {
      setSelectedDifficulties([]);
      // Apply filters immediately
      handleApplyFilters({
        ...filters,
        difficulties: [],
        allDifficulties: true
      });
    }
  };
  
  const toggleAllSubjects = () => {
    const newValue = !allSubjects;
    setAllSubjects(newValue);
    
    if (newValue) {
      setSelectedSubjects([]);
      // Apply filters immediately
      handleApplyFilters({
        ...filters,
        subjects: [],
        allSubjects: true
      });
    }
  };
  
  const toggleAllYears = () => {
    const newValue = !allYears;
    setAllYears(newValue);
    
    if (newValue) {
      setSelectedYears([]);
      // Apply filters immediately
      handleApplyFilters({
        ...filters,
        years: [],
        allYears: true
      });
    }
  };
  
  const handleApplyFilters = (newFilters: QuestionFilter) => {
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Toolbar with filters, settings, and add buttons */}
      <div className="container mx-auto py-2 px-4 border-b">
        <div className="flex justify-between items-center">
          {/* Left side - Filters */}
          <div className="flex space-x-2">
            {/* Difficulty Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Difficulty: {selectedCount.difficulties}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Difficulty Levels</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={allDifficulties}
                  onCheckedChange={toggleAllDifficulties}
                >
                  All Difficulties
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {DIFFICULTIES.map(difficulty => (
                  <DropdownMenuCheckboxItem
                    key={difficulty}
                    checked={selectedDifficulties.includes(difficulty) && !allDifficulties}
                    disabled={allDifficulties}
                    onCheckedChange={() => toggleDifficulty(difficulty)}
                  >
                    {DIFFICULTY_MAP[difficulty]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Subject Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Subject: {selectedCount.subjects}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Subjects</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={allSubjects}
                  onCheckedChange={toggleAllSubjects}
                >
                  All Subjects
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                {SUBJECTS.map(subject => (
                  <DropdownMenuCheckboxItem
                    key={subject}
                    checked={selectedSubjects.includes(subject) && !allSubjects}
                    disabled={allSubjects}
                    onCheckedChange={() => toggleSubject(subject)}
                  >
                    {SUBJECTS_MAP[subject]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Year Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Year: {selectedCount.years}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Years</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={allYears}
                  onCheckedChange={toggleAllYears}
                >
                  All Years
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <div className="max-h-[200px] overflow-y-auto">
                  {YEARS.map(year => (
                    <DropdownMenuCheckboxItem
                      key={year}
                      checked={selectedYears.includes(year.toString()) && !allYears}
                      disabled={allYears}
                      onCheckedChange={() => toggleYear(year.toString())}
                    >
                      {year}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={openAddQuestionModal}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Question
            </Button>
            
            <Button variant="outline" size="sm" onClick={toggleBatchImport}>
              <FileText className="h-4 w-4 mr-2" />
              Batch Import
            </Button>
            
            <Button variant="ghost" size="sm" onClick={openSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        
        {/* Question count display */}
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredQuestions.length} questions (Question {currentQuestion ? currentQuestionIndex + 1 : 0} of {filteredQuestions.length})
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6">
        <div className="flex justify-center">
          {/* Centered Question Reader */}
          <div className="w-full max-w-4xl">
            {currentQuestion ? (
              <QuizReader
                question={currentQuestion}
                onNext={nextQuestion}
                onPrevious={prevQuestion}
                onSkip={skipQuestion}
                onReset={restartQuestion}
                onScoreChange={handleScoreChange}
                currentScore={score}
              />
            ) : (
              <div className="text-center p-12 border rounded-xl bg-muted/50">
                <h2 className="text-2xl font-semibold mb-2">No Questions Found</h2>
                <p className="text-muted-foreground mb-4">
                  Try updating your filters or add a new question to get started.
                </p>
                <Button onClick={openAddQuestionModal}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4 mt-8">
        <div className="container mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} QuizParserinator - A Quiz Bowl Reader Application
        </div>
      </footer>
      
      {/* Modals */}
      <AddQuestionModal 
        isOpen={isAddQuestionModalOpen}
        onClose={closeAddQuestionModal}
      />
      
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
      
      <BatchImportModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        onSuccess={() => {
          // Refresh questions after a successful import
          handleApplyFilters(filters);
        }}
      />
    </div>
  );
}