import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfiguration.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom'; // Updated import
import { FaTimes } from 'react-icons/fa';  // Import "X" icon from react-icons
import './AuthForm.css';
import FlashcardSetList from './FlashcardSetList.jsx';


const AuthorizationForm = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Replaced useHistory with useNavigate

  const isSignUp = location.pathname === "/signup"; // Check if route is /signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true); // New state for auth initialization

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
      setInitializing(false); // Set to false once auth check is done
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      alert('Login successful!');
      navigate('/flashcardSetList');  // Navigate to the flashcard sets page after login
    } catch (error) {
      setError(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
  
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      const idToken = await newUser.getIdToken();
      await sendUserTokenToBackend(idToken, newUser.email);
      setUser(newUser);
      alert('Signup successful!');
  
      // Send email verification
      await sendEmailVerification(newUser);
      alert("Verification email sent. Please verify your email before logging in.");
      navigate('/flashcardSetList');  // Navigate to the flashcard sets page after signup
    } catch (error) {
      setError(`Signup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  const sendUserTokenToBackend = async (idToken, email) => {
    try {
      await axios.post('http://localhost:8080/api/users/create', { idToken, email }, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log('User token sent to backend');
    } catch (error) {
      console.error('Error sending user token to backend:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      alert('Sign-out successful.');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const newUser = result.user;
      setUser(newUser);
      console.log('Google sign-in successful:', newUser);
      alert('Google sign-in successful!');
  
      // Send user token to backend if needed
      const idToken = await newUser.getIdToken();
      await sendUserTokenToBackend(idToken, newUser.email);
  
      // Redirect to flashcard sets after successful login
      navigate('/flashcardSetList');  // Navigate to the flashcard sets page after Google sign-in
    } catch (error) {
      console.error('Google sign-in error:', error.message);
      alert('Google sign-in failed.');
    }
  };
  

  if (initializing) {
    return <div>Loading...</div>; // Show a loading message until auth is initialized
  }
  const handleCancel = () => {
    navigate('/');  // Redirect to the landing page
  };

  return (
    <div>
      {user ? (
        <div>
          {navigate('/flashcardSetList')} {/* Redirect to flashcard sets if user is already signed in */}
        </div>
      ) : (
        <div>
          <button onClick={handleCancel} className="close-button">
            <FaTimes /> {/* X Icon */}
          </button>
          <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={isSignUp ? handleSignup : handleLogin}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            {isSignUp && (
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
              />
            )}
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
            </button>
          </form>
          <button onClick={() => navigate(isSignUp ? '/login' : '/signup')}>
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>

          {/* Google Sign-In Button */}
          <button onClick={handleGoogleSignIn}>Sign in with Google</button>
        </div>
      )}
    </div>
  );
};

export default AuthorizationForm;
