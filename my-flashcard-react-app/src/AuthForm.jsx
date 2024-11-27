import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfiguration.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from 'firebase/auth';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa'; // Import the X icon
import './AuthForm.css';

const AuthorizationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignUp = location.pathname === '/signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) navigate('/flashcardSetList');
  }, [user, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
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
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      const idToken = await newUser.getIdToken();
      await sendUserTokenToBackend(idToken, newUser.email);
      setUser(newUser);
      await sendEmailVerification(newUser);
    } catch (error) {
      setError(`Signup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendUserTokenToBackend = async (idToken, email) => {
    try {
      await axios.post(
        'http://localhost:8080/api/users/create',
        { idToken, email },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
    } catch (error) {
      console.error('Error sending user token to backend:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account', // Forces Google to show the account chooser popup
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const newUser = result.user;

      // Check if there is an existing account for the email
      const email = newUser.email;
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.length > 0 && !signInMethods.includes('google.com')) {
        // Link the Google account to the existing email/password account
        const credential = GoogleAuthProvider.credentialFromResult(result);
        await linkWithCredential(auth.currentUser, credential);
      }

      const idToken = await newUser.getIdToken();
      await sendUserTokenToBackend(idToken, email);
      setUser(newUser);
    } catch (error) {
      setError(`Google sign-in failed: ${error.message}`);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent successfully. Check your inbox.');
    } catch (error) {
      setError(`Failed to send reset email: ${error.message}`);
    } finally {
      setLoading(false);
      setForgotPasswordMode(false);
    }
  };

  if (initializing) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        {/* X Button */}
        <button className="close-button" onClick={() => navigate('/')}>
          <FaTimes />
        </button>

        {forgotPasswordMode ? (
          <>
            <h2>Reset Your Password</h2>
            {error && <p className="auth-error">{error}</p>}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleForgotPassword();
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="auth-input"
                required
              />
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Email'}
              </button>
            </form>
            <p
              className="auth-switch"
              onClick={() => setForgotPasswordMode(false)}
            >
              Back to Login
            </p>
          </>
        ) : (
          <>
            <h2>{isSignUp ? 'Create Your Account' : 'Welcome Back'}</h2>
            {error && <p className="auth-error">{error}</p>}
            <form onSubmit={isSignUp ? handleSignup : handleLogin}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="auth-input"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="auth-input"
                required
              />
              {isSignUp && (
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="auth-input"
                  required
                />
              )}
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
              </button>
            </form>
            <p className="auth-switch">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <span onClick={() => navigate('/login')}>Log in</span>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <span onClick={() => navigate('/signup')}>Sign up</span>
                </>
              )}
            </p>
            <p className="auth-switch">
              Forgot your password?{' '}
              <span
                onClick={() => setForgotPasswordMode(true)}
              >
                Reset Password
              </span>
            </p>
            <div className="google-signin-container">
              <button
                onClick={handleGoogleSignIn}
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

export default AuthorizationForm;
