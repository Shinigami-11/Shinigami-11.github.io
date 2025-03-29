import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/context/QuizContext";
import { Menu, Settings, BarChart, LogOut, Book } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import brainLogo from "@/assets/brain-logo.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { score } = useQuiz();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <div className="text-2xl font-bold flex items-center cursor-pointer">
            <img src={brainLogo} alt="QuizParserinator Logo" className="h-16 w-16 mr-2" />
            QuizParserinator
          </div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/stats">
            <Button variant="link" className="text-white bg-white bg-opacity-20 rounded-full flex items-center">
              <BarChart className="w-4 h-4 mr-1" />
              <span>{score}</span> pts
            </Button>
          </Link>

          <Link href="/quiz">
            <Button variant="link" className="text-white hover:text-white">
              Quiz
            </Button>
          </Link>
          
          <Link href="/flashcards">
            <Button variant="link" className="text-white hover:text-white">
              Flashcards
            </Button>
          </Link>
          
          <Link href="/terms">
            <Button variant="link" className="text-white hover:text-white">
              <Book className="w-4 h-4 mr-1" />
              Terms
            </Button>
          </Link>
          
          {currentUser ? (
            <Button 
              variant="link" 
              className="text-white bg-white bg-opacity-20 rounded-full flex items-center"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          ) : (
            <Link href="/auth">
              <Button variant="link" className="text-white bg-white bg-opacity-20 rounded-full flex items-center">
                Login
              </Button>
            </Link>
          )}
        </div>
        
        <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary/90 text-white">
          <div className="container mx-auto px-4 py-2 flex flex-col">
            <Link href="/stats">
              <Button variant="ghost" className="justify-start text-white">
                <BarChart className="w-4 h-4 mr-2" />
                Stats: <span className="ml-1">{score}</span> pts
              </Button>
            </Link>
            
            <Link href="/quiz">
              <Button variant="ghost" className="justify-start text-white">
                Quiz
              </Button>
            </Link>
            
            <Link href="/flashcards">
              <Button variant="ghost" className="justify-start text-white">
                Flashcards
              </Button>
            </Link>

            <Link href="/terms">
              <Button variant="ghost" className="justify-start text-white">
                <Book className="w-4 h-4 mr-2" />
                Terms of Service
              </Button>
            </Link>
            
            {currentUser ? (
              <Button 
                variant="ghost" 
                className="justify-start text-white"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Link href="/auth">
                <Button variant="ghost" className="justify-start text-white">
                  Login / Register
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
