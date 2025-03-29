import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Log environment variables availability (not their values) for debugging
console.log("Firebase config check:", {
  apiKeyExists: Boolean(import.meta.env.VITE_FIREBASE_API_KEY),
  projectIdExists: Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  appIdExists: Boolean(import.meta.env.VITE_FIREBASE_APP_ID)
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "", // Optional, can be left blank
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

try {
  // Initialize Firebase
  console.log("Initializing Firebase...");
  firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export const app = firebaseApp;
export const auth = firebaseAuth;