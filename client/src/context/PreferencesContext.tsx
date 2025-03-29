import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserPreferences, Keybindings } from '@shared/schema';

// Default keybindings
const defaultKeybindings: Keybindings = {
  buzzIn: 'Space',
  nextQuestion: 'ArrowRight',
  prevQuestion: 'ArrowLeft',
  skipQuestion: 's',
  resetQuestion: 'r',
  toggleDarkMode: 'd',
};

// Default user preferences
const defaultPreferences: UserPreferences = {
  darkMode: false,
  readingSpeed: 5, // 1-10 scale
  buzzTimeout: 5, // seconds
  keybindings: defaultKeybindings,
};

// Try to load saved preferences from localStorage
const getSavedPreferences = (): UserPreferences => {
  try {
    const savedPrefs = localStorage.getItem('quizPreferences');
    if (savedPrefs) {
      return JSON.parse(savedPrefs);
    }
  } catch (error) {
    console.error('Failed to load preferences from localStorage', error);
  }
  return defaultPreferences;
};

// Context type definition
type PreferencesContextType = {
  preferences: UserPreferences;
  setDarkMode: (darkMode: boolean) => void;
  setReadingSpeed: (speed: number) => void;
  setBuzzTimeout: (timeout: number) => void;
  updateKeybinding: (key: keyof Keybindings, value: string) => void;
  resetKeybindings: () => void;
};

// Create the context
const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

// Provider component
export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(getSavedPreferences());

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('quizPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences to localStorage', error);
    }
  }, [preferences]);

  // Apply dark mode class to document
  useEffect(() => {
    if (preferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [preferences.darkMode]);

  const setDarkMode = (darkMode: boolean) => {
    setPreferences(prev => ({ ...prev, darkMode }));
  };

  const setReadingSpeed = (readingSpeed: number) => {
    if (readingSpeed >= 1 && readingSpeed <= 10) {
      setPreferences(prev => ({ ...prev, readingSpeed }));
    }
  };
  
  const setBuzzTimeout = (buzzTimeout: number) => {
    if (buzzTimeout >= 1 && buzzTimeout <= 30) {
      setPreferences(prev => ({ ...prev, buzzTimeout }));
    }
  };

  const updateKeybinding = (key: keyof Keybindings, value: string) => {
    setPreferences(prev => ({
      ...prev,
      keybindings: {
        ...prev.keybindings,
        [key]: value,
      },
    }));
  };

  const resetKeybindings = () => {
    setPreferences(prev => ({
      ...prev,
      keybindings: defaultKeybindings,
    }));
  };

  const value = {
    preferences,
    setDarkMode,
    setReadingSpeed,
    setBuzzTimeout,
    updateKeybinding,
    resetKeybindings,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

// Custom hook to use the preferences context
export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};