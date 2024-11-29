// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"; // Initializes the Firebase application
import { getAnalytics } from "firebase/analytics"; // Provides analytics functionality
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth"; // Provides authentication utilities

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBseaOl8AONrNhQZZEuc_Y-BshgnF3aKg4", // API key for authentication and API calls
  authDomain: "flashcardapp-51975.firebaseapp.com", // Domain for authentication
  projectId: "flashcardapp-51975", // Firebase project identifier
  storageBucket: "flashcardapp-51975.firebasestorage.app", // Storage bucket for file uploads
  messagingSenderId: "216801427643", // Sender ID for Firebase Cloud Messaging
  appId: "1:216801427643:web:0d4fa85f40af08101d299e", // Unique identifier for this app instance
  measurementId: "G-RF2M1J3ZMK" // Identifier for Google Analytics tracking
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // Creates and configures the Firebase app instance
const analytics = getAnalytics(app); // Sets up analytics for the app
export const auth = getAuth(app); // Exports Firebase Authentication instance
export const googleProvider = new GoogleAuthProvider(); // Creates and exports Google authentication provider
export const emailProvider = new EmailAuthProvider(); // Creates and exports email/password authentication provider
