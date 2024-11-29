import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfiguration.js'; // Import Firebase authentication configuration
import {
  signInWithEmailAndPassword, // Firebase method for signing in with email and password
  createUserWithEmailAndPassword, // Firebase method for creating a new user with email and password
  onAuthStateChanged, // Listener for changes in the user's authentication state
  sendEmailVerification, // Firebase method for sending email verification to a user
  sendPasswordResetEmail, // Firebase method for sending a password reset email
  GoogleAuthProvider, // Firebase provider for Google authentication
  signInWithPopup, // Firebase method for signing in with a popup window
  fetchSignInMethodsForEmail, // Firebase method to fetch sign-in methods for a given email
  linkWithCredential, // Firebase method to link multiple credentials to the same user
} from 'firebase/auth';
import axios from 'axios'; // Library for making HTTP requests
import { useLocation, useNavigate } from 'react-router-dom'; // React Router hooks for navigation and location handling
import { FaTimes } from 'react-icons/fa'; // Import the "X" icon for the UI
import './AuthForm.css'; // Import the CSS file for styling

const AuthorizationForm = () => {
  const location = useLocation(); // Get the current location (used to determine if it's a signup page)
  const navigate = useNavigate(); // Hook for programmatic navigation
  const isSignUp = location.pathname === '/signup'; // Check if the current route is for signup

  // State variables for managing input values and app state
  const [email, setEmail] = useState(''); // User's email
  const [password, setPassword] = useState(''); // User's password
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirmation for signup password
  const [user, setUser] = useState(null); // Current authenticated user
  const [loading, setLoading] = useState(false); // Loading indicator for async actions
  const [error, setError] = useState(''); // Error messages for the UI
  const [initializing, setInitializing] = useState(true); // Flag to track if authentication state is initializing
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false); // Toggle for forgot-password functionality

  useEffect(() => {
    // Listen for changes in authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null); // Update the user state
      setInitializing(false); // Mark initialization as complete
    });
    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  useEffect(() => {
    if (user) navigate('/flashcardSetList'); // Redirect authenticated users to flashcard list
  }, [user, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setLoading(true); // Start loading indicator
    setError(''); // Clear any existing errors
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password); // Attempt to log in
      setUser(userCredential.user); // Set the authenticated user
    } catch (error) {
      setError(`Login failed: ${error.message}`); // Display login error
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setLoading(true); // Start loading indicator
    setError(''); // Clear any existing errors
    if (password !== confirmPassword) {
      setError('Passwords do not match'); // Validate passwords match
      setLoading(false); // Stop loading due to validation error
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Create a new user
      const newUser = userCredential.user; // Get the user object
      const idToken = await newUser.getIdToken(); // Fetch the user's ID token
      await sendUserTokenToBackend(idToken, newUser.email); // Send the token to the backend for further processing
      setUser(newUser); // Set the authenticated user
      await sendEmailVerification(newUser); // Send email verification to the user

      navigate('/create'); // Redirect to the create page after signup
    } catch (error) {
      setError(`Signup failed: ${error.message}`); // Display signup error
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const sendUserTokenToBackend = async (idToken, email) => {
    try {
      // Send the user's ID token and email to the backend for account creation or update
      await axios.post(
        'http://localhost:8080/api/users/create', // Backend endpoint for user creation
        { idToken, email }, // Payload containing the token and email
        {
          headers: {
            Authorization: `Bearer ${idToken}`, // Include token in headers for authentication
          },
        }
      );
    } catch (error) {
      console.error('Error sending user token to backend:', error); // Log any errors during the request
    }
  };


  const checkIfUserExists = async (idToken) => {
    try {
      // Make a GET request to check if the user exists in the backend
      const response = await axios.get('http://localhost:8080/api/users/checkIfUserExists', {
        headers: {
          Authorization: `Bearer ${idToken}`, // Include the token in the Authorization header for authentication
        },
      });
      return response.data; // Return user data if the user exists
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // If the response status is 404, it indicates the user does not exist
      }
      console.error('Error checking user existence:', error); // Log any unexpected errors
      throw error; // Rethrow the error for further handling
    }
  };
  
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider(); // Create a Google authentication provider
    provider.setCustomParameters({ prompt: 'select_account' }); // Prompt user to select an account
  
    try {
      // Open a popup window for Google sign-in
      const result = await signInWithPopup(auth, provider);
      const newUser = result.user; // Retrieve the signed-in user
  
      const idToken = await newUser.getIdToken(); // Get the user's ID token
  
      // Check if the user exists in the backend
      const userExists = await checkIfUserExists(idToken);
  
      // Send the user's ID token to the backend for further processing
      await sendUserTokenToBackend(idToken, newUser.email);
  
      setUser(newUser); // Update the current user state
  
      // Redirect based on whether the user exists in the backend
      navigate(userExists ? '/flashcardSetList' : '/create');
    } catch (error) {
      setError(`Google sign-in failed: ${error.message}`); // Display an error message for the user
    }
  };
  
  

  const handleForgotPassword = async () => {
    setLoading(true); // Start loading indicator
    setError(''); // Clear any previous errors
    try {
      await sendPasswordResetEmail(auth, email); // Send a password reset email using Firebase Auth
      setError('Password reset email sent successfully. Check your inbox.'); // Inform the user of success
    } catch (error) {
      setError(`Failed to send reset email: ${error.message}`); // Display any errors encountered
    } finally {
      setLoading(false); // Stop loading indicator
      setForgotPasswordMode(false); // Exit forgot-password mode
    }
  };
  
  if (initializing) {
    // Show a loading screen while the authentication state is initializing
    return <div className="loading-screen">Loading...</div>;
  }
  
  return (
    <div className="auth-container">
      <div className="auth-form">
        {/* Close button (navigates to home page) */}
        <button className="close-button" onClick={() => navigate('/')}>
          <FaTimes /> {/* Icon for the close button */}
        </button>
  
        {forgotPasswordMode ? (
          <>
            {/* Forgot password mode */}
            <h2>Reset Your Password</h2>
            {error && <p className="auth-error">{error}</p>} {/* Show error messages if any */}
            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevent default form submission
                handleForgotPassword(); // Trigger forgot-password handler
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update email state
                placeholder="Enter your email"
                className="auth-input" // Styled input
                required
              />
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Email'} {/* Button text changes based on loading state */}
              </button>
            </form>
            <p
              className="auth-switch"
              onClick={() => setForgotPasswordMode(false)} // Switch back to login form
            >
              Back to Login
            </p>
          </>
        ) : (
          <>
            {/* Login or Sign-Up form */}
            <h2>{isSignUp ? 'Create Your Account' : 'Welcome Back'}</h2>
            {error && <p className="auth-error">{error}</p>} {/* Show error messages if any */}
            <form onSubmit={isSignUp ? handleSignup : handleLogin}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update email state
                placeholder="Email"
                className="auth-input" // Styled input
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update password state
                placeholder="Password"
                className="auth-input" // Styled input
                required
              />
              {isSignUp && (
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} // Update confirm password state
                  placeholder="Confirm Password"
                  className="auth-input" // Styled input
                  required
                />
              )}
              <button type="submit" className="auth-button" disabled={loading}>
                {loading
                  ? 'Processing...'
                  : isSignUp
                  ? 'Sign Up'
                  : 'Login'} {/* Button text based on form type and loading state */}
              </button>
            </form>
            <p className="auth-switch">
              {isSignUp ? (
                <>
                  {/* Switch to login form if currently in sign-up mode */}
                  Already have an account?{' '}
                  <span onClick={() => navigate('/login')}>Log in</span>
                </>
              ) : (
                <>
                  {/* Switch to sign-up form if currently in login mode */}
                  Don't have an account?{' '}
                  <span onClick={() => navigate('/signup')}>Sign up</span>
                </>
              )}
            </p>
            <p className="auth-switch">
              {/* Trigger forgot-password mode */}
              Forgot your password?{' '}
              <span onClick={() => setForgotPasswordMode(true)}>
                Reset Password
              </span>
            </p>
            <div className="google-signin-container">
              {/* Google Sign-In button */}
              <button
                onClick={handleGoogleSignIn} // Trigger Google Sign-In
                className="google-signin-button"
              >
                Sign in with Google
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
  export default AuthorizationForm; // Export the component for use elsewhere  