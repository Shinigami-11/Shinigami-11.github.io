import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Question } from "@shared/schema";
import { Filter, ArrowRight, Check, X } from "lucide-react";
import { DIFFICULTIES, SUBJECTS, YEARS, DIFFICULTY_MAP, SUBJECTS_MAP } from "@/lib/constants";
import Header from "@/components/layout/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function QuizPage() {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [difficulty, setDifficulty] = useState("all");
  const [subject, setSubject] = useState("all");
  const [year, setYear] = useState("all");
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<string[]>([]);

  // Fetch questions
  const { data: questions = [], isLoading, refetch } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  // Filter questions based on selected filters
  const filteredQuestions = questions.filter(q => {
    const difficultyMatch = difficulty === "all" || q.difficulty === difficulty;
    const subjectMatch = subject === "all" || q.subject === subject;
    const yearMatch = year === "all" || q.year.toString() === year;
    return difficultyMatch && subjectMatch && yearMatch;
  });

  // Initialize the quiz
  const handleStartQuiz = () => {
    if (filteredQuestions.length < 5) {
      toast({
        title: "Not enough questions",
        description: "You need at least 5 questions to start a quiz. Try adjusting your filters.",
        variant: "destructive"
      });
      return;
    }

    setIsQuizStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer("");
    setShowResult(false);
    generateMultipleChoiceAnswers(0);
  };

  // Generate multiple choice answers for a question
  const generateMultipleChoiceAnswers = (index: number) => {
    if (!filteredQuestions[index]) return;
    
    const currentQuestion = filteredQuestions[index];
    const correctAns = currentQuestion.answer;
    setCorrectAnswer(correctAns);
    
    // Get 3 random questions different from the current one for wrong answers
    const availableQuestions = questions.filter(q => q.id !== currentQuestion.id);
    const randomQuestions = [];
    
    // Get 3 unique random questions
    while (randomQuestions.length < 3 && availableQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      randomQuestions.push(availableQuestions[randomIndex]);
      availableQuestions.splice(randomIndex, 1);
    }
    
    // Get answers from these questions
    const wrongAnswers = randomQuestions.map(q => q.answer);
    
    // Create an array with correct and wrong answers, then shuffle
    const allAnswers = [correctAns, ...wrongAnswers];
    
    // Shuffle the answers
    for (let i = allAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }
    
    setMultipleChoiceAnswers(allAnswers);
  };

  // Handle answer selection and move to next question
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (answer === correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer("");
      setShowResult(false);
      generateMultipleChoiceAnswers(currentQuestionIndex + 1);
    } else {
      // Quiz finished
      toast({
        title: "Quiz completed!",
        description: `Your score: ${score + (selectedAnswer === correctAnswer ? 1 : 0)}/${filteredQuestions.length}`,
      });
      setIsQuizStarted(false);
    }
  };

  // Get current question
  const currentQuestion = filteredQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container py-6 max-w-4xl mx-auto flex-1">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">Multiple Choice Quiz</h1>
          
          {!isQuizStarted ? (
            <Card>
              <CardHeader>
                <CardTitle>Quiz Settings</CardTitle>
                <CardDescription>
                  Select filters to customize your quiz. You need at least 5 matching questions to start.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        {DIFFICULTIES.map(diff => (
                          <SelectItem key={diff} value={diff}>
                            {DIFFICULTY_MAP[diff]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {SUBJECTS.map(sub => (
                          <SelectItem key={sub} value={sub}>
                            {SUBJECTS_MAP[sub]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {YEARS.map(y => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {filteredQuestions.length} questions match your criteria
                    </span>
                    <Button 
                      onClick={handleStartQuiz}
                      disabled={filteredQuestions.length < 5}
                      className="px-8"
                    >
                      Start Quiz
                    </Button>
                  </div>
                  
                  {filteredQuestions.length < 5 && (
                    <p className="text-sm text-destructive">
                      You need at least 5 questions to start a quiz. Try adjusting your filters.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Quiz progress */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">
                  Question {currentQuestionIndex + 1} of {filteredQuestions.length}
                </span>
                <span className="text-sm font-medium">
                  Score: {score}/{filteredQuestions.length}
                </span>
              </div>
              <Progress value={(currentQuestionIndex + 1) / filteredQuestions.length * 100} className="mb-6" />
              
              {/* Question card */}
              {currentQuestion && (
                <Card className="mb-4">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary-foreground mr-2">
                          {DIFFICULTY_MAP[currentQuestion.difficulty]}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary-foreground">
                          {SUBJECTS_MAP[currentQuestion.subject]}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {currentQuestion.year}
                      </span>
                    </div>
                    <CardTitle className="text-xl mt-2">{currentQuestion.text}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      value={selectedAnswer} 
                      onValueChange={handleAnswerSelect}
                      className="space-y-3"
                      disabled={showResult}
                    >
                      {multipleChoiceAnswers.map((answer, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center space-x-2 p-3 rounded-md border ${
                            showResult && answer === correctAnswer 
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                              : showResult && answer === selectedAnswer && answer !== correctAnswer
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-muted-foreground/20'
                          }`}
                        >
                          <RadioGroupItem value={answer} id={`answer-${idx}`} />
                          <Label htmlFor={`answer-${idx}`} className="flex-1 cursor-pointer">
                            {answer}
                          </Label>
                          {showResult && answer === correctAnswer && (
                            <Check className="h-5 w-5 text-green-500" />
                          )}
                          {showResult && answer === selectedAnswer && answer !== correctAnswer && (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      ))}
                    </RadioGroup>
                    
                    {showResult && (
                      <div className="mt-6 flex justify-end">
                        <Button onClick={handleNextQuestion}>
                          {currentQuestionIndex < filteredQuestions.length - 1 ? (
                            <>
                              Next Question
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            "Finish Quiz"
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
      
      <footer className="border-t py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} QuizParserinator - A Quiz Bowl Reader Application
        </div>
      </footer>
    </div>
  );
}