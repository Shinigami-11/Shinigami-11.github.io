import React, { useState } from 'react';
import { useQuiz } from '@/context/QuizContext';
import { QuizDifficulty, QuizSubject } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { X, Text, Tag, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ isOpen, onClose }) => {
  const { addQuestion } = useQuiz();
  const { toast } = useToast();
  
  // Years array from 2017 to 2025
  const years = Array.from({ length: 9 }, (_, i) => (2025 - i).toString());
  
  type FormData = {
    difficulty: "district" | "regional" | "state";
    subject: "math" | "science" | "arts" | "social" | "language";
    year: string;
    text: string;
    answer: string;
  };
  
  const [formData, setFormData] = useState<FormData>({
    difficulty: QuizDifficulty.DISTRICT,
    subject: QuizSubject.MATH,
    year: '2023',
    text: '',
    answer: '',
  });
  
  // State to track if we're in simple mode (just question/answer) or full mode
  const [simpleMode, setSimpleMode] = useState(false);
  
  const [errors, setErrors] = useState({
    text: '',
    answer: '',
  });
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (name === 'text' || name === 'answer') {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    let valid = true;
    const newErrors = { text: '', answer: '' };
    
    if (!formData.text.trim()) {
      newErrors.text = 'Question text is required';
      valid = false;
    }
    
    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      // Convert formData to match the expected type
      const questionData = {
        // If in simple mode, use default values
        difficulty: simpleMode ? QuizDifficulty.DISTRICT : formData.difficulty,
        subject: simpleMode ? QuizSubject.MATH : formData.subject,
        year: simpleMode ? new Date().getFullYear().toString() : formData.year,
        text: formData.text,
        answer: formData.answer
      };
      
      // Type assertion to avoid TypeScript errors
      await addQuestion(questionData as any);
      
      toast({
        title: 'Success',
        description: 'New question added successfully to your local storage!',
      });
      onClose();
      // Reset form
      setFormData({
        difficulty: QuizDifficulty.DISTRICT,
        subject: QuizSubject.MATH,
        year: '2023',
        text: '',
        answer: '',
      });
      // Keep simple mode setting as is for user convenience
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add question. Please try again.',
        variant: 'destructive',
      });
      console.error('Error adding question:', error);
    }
  };
  
  const handleDifficultyChange = (value: string) => {
    setFormData({
      ...formData,
      difficulty: value as "district" | "regional" | "state"
    });
  };
  
  const handleSubjectChange = (value: string) => {
    setFormData({
      ...formData,
      subject: value as "math" | "science" | "arts" | "social" | "language"
    });
  };
  
  const handleYearChange = (value: string) => {
    setFormData({
      ...formData,
      year: value
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Add New Question
          </DialogTitle>
          <DialogDescription>
            Create a new question for the quiz. 
            {simpleMode ? 
              "Just enter the question and answer." : 
              "Fill out all fields below."}
            <span className="mt-2 block text-sm font-medium text-primary">
              Your questions will be stored locally in your browser and won't be shared with other users.
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Label htmlFor="simple-mode">Simple Question/Answer Mode</Label>
              <Switch
                id="simple-mode"
                checked={simpleMode}
                onCheckedChange={setSimpleMode}
              />
            </div>
            
            {!simpleMode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        Difficulty
                      </span>
                    </Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={handleDifficultyChange}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={QuizDifficulty.DISTRICT}>District</SelectItem>
                        <SelectItem value={QuizDifficulty.REGIONAL}>Regional</SelectItem>
                        <SelectItem value={QuizDifficulty.STATE}>State</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Year
                      </span>
                    </Label>
                    <Select
                      value={formData.year}
                      onValueChange={handleYearChange}
                    >
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">
                    <span className="flex items-center gap-1">
                      <Text className="h-4 w-4" />
                      Subject
                    </span>
                  </Label>
                  <Select
                    value={formData.subject}
                    onValueChange={handleSubjectChange}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={QuizSubject.MATH}>Math</SelectItem>
                      <SelectItem value={QuizSubject.SCIENCE}>Science</SelectItem>
                      <SelectItem value={QuizSubject.ARTS}>Arts and Humanities</SelectItem>
                      <SelectItem value={QuizSubject.SOCIAL}>Social Studies</SelectItem>
                      <SelectItem value={QuizSubject.LANGUAGE}>Language Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="text" className={errors.text ? "text-destructive" : ""}>
                Question Text
              </Label>
              <Textarea
                id="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                className={errors.text ? "border-destructive" : ""}
                placeholder="Enter the full question text here..."
                rows={5}
              />
              {errors.text && (
                <p className="text-sm font-medium text-destructive">{errors.text}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Type your complete question. For tossups, include the full text that would be read.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="answer" className={errors.answer ? "text-destructive" : ""}>
                Answer
              </Label>
              <Input
                id="answer"
                name="answer"
                type="text"
                value={formData.answer}
                onChange={handleChange}
                className={errors.answer ? "border-destructive" : ""}
                placeholder="Enter the correct answer..."
              />
              {errors.answer && (
                <p className="text-sm font-medium text-destructive">{errors.answer}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter the correct answer. The system uses fuzzy matching so minor variations will be accepted.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Question
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuestionModal;
