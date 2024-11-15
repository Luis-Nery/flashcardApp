import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import AuthForm from './AuthForm';  // Your AuthorizationForm
import './App.css';
import FlashcardSetPage from './FlashcardSetPage';  // New import
import Layout from './Layout';  // Import the new Layout component
import FlashcardSetList from './FlashcardSetList';  // Import the FlashcardSetList component
import CreateFlashcardSetPage from './CreateFlashcardSetPage.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Routes without Navbar */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthForm />} />
        <Route path="/signup" element={<AuthForm />} />

        {/* Routes with Navbar and Sign-out button */}

        <Route path="/" element={<Layout />}> {/* This layout wraps the following routes */}
          <Route path="/flashcardSetList" element={<FlashcardSetList />} />  {/* Add FlashcardSetList route */}
          <Route path="/flashcardSet/:setId" element={<FlashcardSetPage />} />  {/* New Route */}
          <Route path="/create" element={<CreateFlashcardSetPage />} />  {/* New Route for creating a set */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
