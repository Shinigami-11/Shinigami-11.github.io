import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";

export default function DarkModeToggle() {
  const { preferences, setDarkMode } = usePreferences();
  
  const toggleDarkMode = () => {
    setDarkMode(!preferences.darkMode);
  };
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleDarkMode} 
      aria-label="Toggle dark mode"
      title={preferences.darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {preferences.darkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}