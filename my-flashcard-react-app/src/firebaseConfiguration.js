// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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