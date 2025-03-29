import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useQuiz } from "@/lib/quiz-context";

export default function ScoreTracker() {
  const { 
    score, 
    correctAnswers, 
    incorrectAnswers, 
    skippedQuestions,
    questions,
  } = useQuiz();

  const questionsAttempted = correctAnswers + incorrectAnswers;
  const totalQuestions = questions.length;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Score Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{score}</div>
              <div className="text-gray-600 mt-1">Total Points</div>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-gray-600 mt-1">Correct</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{incorrectAnswers}</div>
                <div className="text-gray-600 mt-1">Incorrect</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-700">
                  {questionsAttempted}/{totalQuestions}
                </div>
                <div className="text-gray-600 mt-1">Attempted</div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{skippedQuestions}</div>
                <div className="text-gray-600 mt-1">Skipped</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
