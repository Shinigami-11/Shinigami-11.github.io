import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DIFFICULTIES, SUBJECTS, YEARS, DIFFICULTY_MAP, SUBJECTS_MAP } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchImportModal({ isOpen, onClose, onSuccess }: BatchImportModalProps) {
  const [text, setText] = useState('');
  const [defaultDifficulty, setDefaultDifficulty] = useState('district');
  const [defaultSubject, setDefaultSubject] = useState('math');
  const [defaultYear, setDefaultYear] = useState(new Date().getFullYear().toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some question text to import.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/questions/import-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          defaultDifficulty,
          defaultSubject,
          defaultYear,
        }),
      });
      
      const data = await response.json();
      
      toast({
        title: 'Success',
        description: `Successfully imported ${data.count} questions!`,
      });
      
      setText('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error importing questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to import questions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Batch Import Questions
          </DialogTitle>
          <DialogDescription>
            Paste multiple questions to import them all at once. Questions should be separated by numbers or clear formatting.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultDifficulty">Default Difficulty</Label>
              <Select 
                value={defaultDifficulty} 
                onValueChange={setDefaultDifficulty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {DIFFICULTY_MAP[difficulty]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultSubject">Default Subject</Label>
              <Select 
                value={defaultSubject} 
                onValueChange={setDefaultSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {SUBJECTS_MAP[subject]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultYear">Default Year</Label>
              <Select 
                value={defaultYear} 
                onValueChange={setDefaultYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="questionText">Questions Text</Label>
            <Textarea
              id="questionText"
              placeholder={`Paste your questions here. Format example:

1. This mathematician developed calculus. Who is this person?
Answer: Isaac Newton

2. This scientist discovered the theory of relativity.
Answer: Albert Einstein

Subject: Science
Difficulty: Regional
Year: 2021

You can include metadata like Subject, Difficulty, and Year in the text.`}
              rows={15}
              value={text}
              onChange={e => setText(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          
          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Importing...' : 'Import Questions'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}