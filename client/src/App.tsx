import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Flashcards from "@/pages/Flashcards";
import Quiz from "@/pages/Quiz";
import Stats from "@/pages/Stats";
import Auth from "@/pages/Auth";
import TermsOfService from "@/pages/TermsOfService";
import { QuizProvider } from "@/context/QuizContext";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { AuthProvider } from "@/context/AuthContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/flashcards" component={Flashcards} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/stats" component={Stats} />
      <Route path="/auth" component={Auth} />
      <Route path="/terms" component={TermsOfService} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PreferencesProvider>
          <QuizProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Router />
              <Toaster />
            </div>
          </QuizProvider>
        </PreferencesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
