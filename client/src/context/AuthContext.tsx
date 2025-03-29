import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  Auth
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  registerWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if auth is available (might be null if Firebase failed to initialize)
    if (!auth) {
      console.error("Firebase auth is not available");
      setError("Firebase authentication is not available. Please check your configuration.");
      setLoading(false);
      
      toast({
        title: "Authentication Error",
        description: "Unable to initialize Firebase. Please check your API keys.",
        variant: "destructive"
      });
      
      return () => {};
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      }, (authError) => {
        console.error("Auth state change error:", authError);
        setError(authError.message);
        setLoading(false);
        
        toast({
          title: "Authentication Error",
          description: authError.message,
          variant: "destructive"
        });
      });

      return unsubscribe;
    } catch (err: any) {
      console.error("Error setting up auth state listener:", err);
      setError(err.message);
      setLoading(false);
      
      toast({
        title: "Authentication Error",
        description: err.message,
        variant: "destructive"
      });
      
      return () => {};
    }
  }, [toast]);

  async function loginWithGoogle() {
    if (!auth) {
      const msg = "Firebase authentication is not available";
      console.error(msg);
      toast({
        title: "Authentication Error",
        description: msg,
        variant: "destructive"
      });
      throw new Error(msg);
    }
    
    const provider = new GoogleAuthProvider();
    try {
      // We're using signInWithPopup for desktop but could use redirect for mobile
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      toast({
        title: "Authentication Error",
        description: error.message || "Error signing in with Google",
        variant: "destructive"
      });
      throw error;
    }
  }

  async function loginWithEmailAndPassword(email: string, password: string) {
    if (!auth) {
      const msg = "Firebase authentication is not available";
      console.error(msg);
      toast({
        title: "Authentication Error",
        description: msg,
        variant: "destructive"
      });
      throw new Error(msg);
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Error signing in with email/password", error);
      toast({
        title: "Authentication Error",
        description: error.message || "Error signing in with email/password",
        variant: "destructive"
      });
      throw error;
    }
  }

  async function registerWithEmailAndPassword(email: string, password: string) {
    if (!auth) {
      const msg = "Firebase authentication is not available";
      console.error(msg);
      toast({
        title: "Authentication Error",
        description: msg,
        variant: "destructive"
      });
      throw new Error(msg);
    }
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Error registering with email/password", error);
      toast({
        title: "Authentication Error",
        description: error.message || "Error registering with email/password",
        variant: "destructive"
      });
      throw error;
    }
  }

  async function logout() {
    if (!auth) {
      const msg = "Firebase authentication is not available";
      console.error(msg);
      toast({
        title: "Authentication Error",
        description: msg,
        variant: "destructive"
      });
      throw new Error(msg);
    }
    
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Error signing out", error);
      toast({
        title: "Authentication Error",
        description: error.message || "Error signing out",
        variant: "destructive"
      });
      throw error;
    }
  }

  const value = {
    currentUser,
    loading,
    loginWithGoogle,
    loginWithEmailAndPassword,
    registerWithEmailAndPassword,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}