import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Clock, Trash2, RefreshCw } from "lucide-react";
import type { Question, Flashcard } from "@shared/schema";
import Header from "@/components/layout/header";

export default function FlashcardsPage() {
  const [activeTab, setActiveTab] = useState("view");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const { toast } = useToast();

  // Fetch flashcards
  const {
    data: flashcards = [] as Flashcard[],
    isLoading: isLoadingFlashcards,
    isError: isFlashcardsError,
  } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards"],
    enabled: activeTab === "view",
  });

  // Fetch questions for adding to flashcards
  const {
    data: questions = [] as Question[],
    isLoading: isLoadingQuestions,
    isError: isQuestionsError,
  } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
    enabled: activeTab === "add",
  });

  // Mutation to add a question to flashcards
  const addToFlashcardsMutation = useMutation({
    mutationFn: async (questionId: number) => {
      return await apiRequest(
        "POST",
        "/api/flashcards", 
        {
          questionId,
          dateAdded: new Date().toISOString(),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
      toast({
        title: "Success",
        description: "Question added to flashcards",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add question to flashcards",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a flashcard
  const deleteFlashcardMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(
        "DELETE",
        `/api/flashcards/${id}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
      toast({
        title: "Success",
        description: "Flashcard removed",
      });
      // Reset to first card if we deleted the current one
      if (currentCardIndex >= flashcards.length - 1) {
        setCurrentCardIndex(Math.max(0, flashcards.length - 2));
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove flashcard",
        variant: "destructive",
      });
    },
  });

  // Mutation to update flashcard review info
  const updateFlashcardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Flashcard> }) => {
      return await apiRequest(
        "PATCH",
        `/api/flashcards/${id}`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
    },
  });

  // Get corresponding question for the current flashcard
  const getCurrentQuestion = (): Question | undefined => {
    if (!flashcards.length || currentCardIndex >= flashcards.length) return undefined;
    
    const currentFlashcard = flashcards[currentCardIndex];
    const question = questions.find(q => q.id === currentFlashcard.questionId);
    return question;
  };
  
  const currentQuestion = getCurrentQuestion();

  // Handle navigation
  const goToNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const goToPreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  // Handle marking as reviewed
  const markAsReviewed = () => {
    if (!flashcards.length) return;
    
    const flashcard = flashcards[currentCardIndex];
    updateFlashcardMutation.mutate({
      id: flashcard.id,
      data: {
        lastReviewed: new Date().toISOString(),
        timesReviewed: (flashcard.timesReviewed || 0) + 1,
      },
    });
    
    goToNextCard();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container max-w-6xl py-6 flex-1">
        <h1 className="text-3xl font-bold mb-6">Flashcards</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">Study Flashcards</TabsTrigger>
          <TabsTrigger value="add">Add New Flashcards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="mt-6">
          {isLoadingFlashcards ? (
            <div className="space-y-4">
              <Skeleton className="h-[300px] w-full rounded-lg" />
              <div className="flex justify-between">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          ) : isFlashcardsError ? (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">Failed to load flashcards</p>
            </div>
          ) : flashcards.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">No flashcards added yet</p>
              <p className="text-muted-foreground mb-4">Go to the "Add New Flashcards" tab to add some questions to study</p>
              <Button onClick={() => setActiveTab("add")}>Add Flashcards</Button>
            </div>
          ) : (
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Card {currentCardIndex + 1} of {flashcards.length}
              </div>
              
              <Card className="min-h-[300px]">
                <CardHeader>
                  <CardTitle>
                    {currentQuestion?.subject} ({currentQuestion?.difficulty}) - {currentQuestion?.year}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentQuestion ? (
                    <div>
                      <p className="text-lg">{currentQuestion.text}</p>
                      {showAnswer && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="font-bold">Answer:</p>
                          <p>{currentQuestion.answer}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Question not found</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAnswer(!showAnswer)}
                    >
                      {showAnswer ? "Hide Answer" : "Show Answer"}
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={markAsReviewed}
                      disabled={updateFlashcardMutation.isPending}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Mark Reviewed
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={goToPreviousCard}
                      disabled={currentCardIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button 
                      onClick={goToNextCard}
                      disabled={currentCardIndex === flashcards.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to remove this flashcard?")) {
                      const flashcardId = flashcards[currentCardIndex].id;
                      deleteFlashcardMutation.mutate(flashcardId);
                    }
                  }}
                  disabled={deleteFlashcardMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove from Flashcards
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Select Questions to Add</h2>
          
          {isLoadingQuestions ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[150px] w-full rounded-lg" />
              ))}
            </div>
          ) : isQuestionsError ? (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">Failed to load questions</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">No questions available</p>
              <p className="text-muted-foreground mb-4">Add some questions first</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {questions.map((question) => {
                const isAdded = flashcards.some(fc => fc.questionId === question.id);
                
                return (
                  <Card key={question.id} className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {question.subject} ({question.difficulty}) - {question.year}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="line-clamp-3">{question.text}</p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        variant={isAdded ? "secondary" : "default"}
                        onClick={() => {
                          if (!isAdded) {
                            addToFlashcardsMutation.mutate(question.id);
                          }
                        }}
                        disabled={isAdded || addToFlashcardsMutation.isPending}
                      >
                        {isAdded ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Already Added
                          </>
                        ) : (
                          <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add to Flashcards
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
      <footer className="border-t py-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} QuizParserinator - A Quiz Bowl Reader Application
        </div>
      </footer>
    </div>
  );
}