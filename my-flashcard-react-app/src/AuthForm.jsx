import React, { useState } from 'react';
import {auth} from "./firebaseConfiguration.js";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);


  // Function to handle login
  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Retrieve ID token and send it to backend
      if (user) {
        const idToken = await user.getIdToken();
        await retrieveUserFromBackEnd(idToken);
      }
      alert("Login successful and user data sent to backend!");
    } catch (error) {
      console.error("Error logging in:", error.message);
      alert("Login failed.");
    }
  };

  // Function to handle signup
  const handleSignup = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Retrieve ID token and send it to backend
      if (user) {
        const idToken = await user.getIdToken();
        await sendUserTokenToBackend(idToken,user.email);
      }
      alert("Signup successful and user data sent to backend!");
    } catch (error) {
      console.error("Error signing up:", error.message);
      alert("Signup failed.");
    }
  };

  // Function to send the user ID token to the backend
  const sendUserTokenToBackend = async (idToken,email) => {
    try {
        const userData = idToken;
      const response =await axios.post('http://localhost:8080/api/users/create', {userData,email}, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log("User token sent to backend and user saved successfully:", response.data);
    } catch (error) {
      console.error("Error sending user token to backend:", error);
      alert("Failed to save user to backend.");
    }
  };

  const retrieveUserFromBackEnd = async (idToken) => {
    try {
        await axios.get('/api/users/create', {}, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        console.log("User token request to backend and retrieved successfully.");
      } catch (error) {
        console.error("Error sending user token to backend:", error);
        alert("Failed to retrieve user from backend.");
      }
};

  return (
    <div>
      <h2>{isSignUp ? "Sign Up" : "Login"}</h2>
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
        <button type="submit">{isSignUp ? "Sign Up" : "Login"}</button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
};

export default AuthForm;
