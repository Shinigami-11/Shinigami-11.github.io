import { useQuery } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import { SUBJECTS_MAP, DIFFICULTY_MAP } from "@/lib/constants";
import { HistoryWithQuestion } from "@shared/schema";

const QuestionHistory = () => {
  const { data: history, isLoading, isError } = useQuery<HistoryWithQuestion[]>({
    queryKey: ['/api/history'],
  });
  
  const hasHistory = history && history.length > 0;
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-medium text-neutral-dark mb-4 flex items-center">
            <History className="mr-2 text-primary" />
            Question History
          </h2>
          <div className="py-4 text-center">Loading history...</div>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-medium text-neutral-dark mb-4 flex items-center">
            <History className="mr-2 text-primary" />
            Question History
          </h2>
          <div className="py-4 text-center text-error">Error loading history</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-medium text-neutral-dark mb-4 flex items-center">
          <History className="mr-2 text-primary" />
          Question History
        </h2>
        
        {hasHistory ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Your Answer</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item, index) => {
                  const subjectLabel = SUBJECTS_MAP[item.question.subject as keyof typeof SUBJECTS_MAP] || item.question.subject;
                  const difficultyLabel = DIFFICULTY_MAP[item.question.difficulty as keyof typeof DIFFICULTY_MAP] || item.question.difficulty;
                  
                  return (
                    <TableRow key={item.id} className="hover:bg-neutral-light hover:bg-opacity-10">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{subjectLabel}</TableCell>
                      <TableCell>{difficultyLabel}</TableCell>
                      <TableCell>
                        {item.isSkipped ? (
                          <span className="text-neutral-medium italic">Skipped</span>
                        ) : (
                          item.userAnswer || "No answer"
                        )}
                      </TableCell>
                      <TableCell>
                        {item.isSkipped ? (
                          <Badge variant="outline" className="bg-neutral-light text-neutral-dark flex items-center w-fit">
                            <MinusCircle className="mr-1 h-3 w-3" />
                            Skipped
                          </Badge>
                        ) : item.isCorrect ? (
                          <Badge className="bg-success text-white flex items-center w-fit">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge className="bg-error text-white flex items-center w-fit">
                            <XCircle className="mr-1 h-3 w-3" />
                            Incorrect
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <div className="text-neutral-medium mb-3">No question history yet</div>
            <div className="text-sm text-neutral-light">Answer some questions to see your results here</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionHistory;
