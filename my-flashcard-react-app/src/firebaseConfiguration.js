// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBseaOl8AONrNhQZZEuc_Y-BshgnF3aKg4",
  authDomain: "flashcardapp-51975.firebaseapp.com",
  projectId: "flashcardapp-51975",
  storageBucket: "flashcardapp-51975.firebasestorage.app",
  messagingSenderId: "216801427643",
  appId: "1:216801427643:web:0d4fa85f40af08101d299e",
  measurementId: "G-RF2M1J3ZMK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider(); // Export EmailAuthProvider
