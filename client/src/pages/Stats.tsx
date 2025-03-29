import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Question } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Header from "@/components/layout/header";
import { SUBJECTS_MAP, DIFFICULTY_MAP } from "@/lib/constants";

export default function StatsPage() {
  // Fetch questions to analyze
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });
  
  // Get the current score
  const { data: score = 0 } = useQuery<number>({
    queryKey: ["/api/score"],
  });

  // Calculate statistics
  const totalQuestions = questions.length;
  
  // Count by subject
  const subjectCounts = questions.reduce<Record<string, number>>((acc, question) => {
    acc[question.subject] = (acc[question.subject] || 0) + 1;
    return acc;
  }, {});
  
  // Count by difficulty
  const difficultyCounts = questions.reduce<Record<string, number>>((acc, question) => {
    acc[question.difficulty] = (acc[question.difficulty] || 0) + 1;
    return acc;
  }, {});
  
  // Count by year
  const yearCounts = questions.reduce<Record<string, number>>((acc, question) => {
    acc[question.year.toString()] = (acc[question.year.toString()] || 0) + 1;
    return acc;
  }, {});
  
  // Format data for charts
  const subjectData = Object.entries(subjectCounts).map(([subject, count]) => ({
    name: SUBJECTS_MAP[subject] || subject,
    value: count,
    percent: Math.round((count / totalQuestions) * 100)
  }));
  
  const difficultyData = Object.entries(difficultyCounts).map(([difficulty, count]) => ({
    name: DIFFICULTY_MAP[difficulty] || difficulty,
    value: count,
    percent: Math.round((count / totalQuestions) * 100)
  }));
  
  const yearData = Object.entries(yearCounts)
    .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
    .map(([year, count]) => ({
      name: year,
      value: count,
      percent: Math.round((count / totalQuestions) * 100)
    }));
  
  // Colors for pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF'];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container py-6 flex-1">
        <h1 className="text-3xl font-bold mb-6">Statistics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Questions</CardTitle>
              <CardDescription>Questions in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalQuestions}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Current Score</CardTitle>
              <CardDescription>From quiz sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{score}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Subjects</CardTitle>
              <CardDescription>Number of subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{Object.keys(subjectCounts).length}</p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="subjects" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="subjects">By Subject</TabsTrigger>
            <TabsTrigger value="difficulties">By Difficulty</TabsTrigger>
            <TabsTrigger value="years">By Year</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle>Questions by Subject</CardTitle>
                <CardDescription>Distribution of questions across subjects</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={subjectData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" name="Questions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subjectData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${percent}%`}
                        >
                          {subjectData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="difficulties">
            <Card>
              <CardHeader>
                <CardTitle>Questions by Difficulty</CardTitle>
                <CardDescription>Distribution of questions across difficulty levels</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={difficultyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#82ca9d" name="Questions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={difficultyData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#82ca9d"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${percent}%`}
                        >
                          {difficultyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="years">
            <Card>
              <CardHeader>
                <CardTitle>Questions by Year</CardTitle>
                <CardDescription>Distribution of questions across years</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={yearData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#ffc658" name="Questions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
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