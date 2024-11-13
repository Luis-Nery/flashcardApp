import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebaseConfiguration';

const MyNavigationBar = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/'); // Redirect to the login page after signing out
    } catch (err) {
      console.error("Error signing out: ", err);
    }
  };

  return (
    <nav>
      <h2>Flashcard App</h2>
      <button onClick={handleSignOut}>Sign Out</button>
    </nav>
  );
};

export default MyNavigationBar;
