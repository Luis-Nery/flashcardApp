import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage'; // Component for the landing page.
import AuthForm from './AuthForm'; // Component for login/signup forms.
import './App.css'; // Global CSS for the application.
import FlashcardSetPage from './FlashcardSetPage'; // Component to display a specific flashcard set.
import Layout from './Layout'; // Component providing a consistent layout (e.g., Navbar) for specific pages.
import FlashcardSetList from './FlashcardSetList'; // Component to list all flashcard sets.
import CreateFlashcardSetPage from './CreateFlashcardSetPage.jsx'; // Component for creating a new flashcard set.
import Settings from './Settings.jsx'; // Component for user account settings.
import FlashcardTestPage from './FlashcardTestPage.jsx'; // Component for testing a flashcard set.

/**
 * Root component of the application that configures routing and layout.
 * Utilizes React Router for navigation between various pages and components.
 *
 * @returns {JSX.Element} The application's main component with configured routes.
 */
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Routes without Navbar */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthForm />} />
        <Route path="/signup" element={<AuthForm />} />

        {/* Routes with Navbar and Sign-out button */}
        <Route path="/" element={<Layout />}>
          {/* The Layout component wraps these nested routes */}
          
          {/* Displays a list of all flashcard sets */}
          <Route path="/flashcardSetList" element={<FlashcardSetList />} />
          
          {/* Displays a specific flashcard set by its ID */}
          <Route path="/flashcardSet/:setId" element={<FlashcardSetPage />} />
          
          {/* Route to create a new flashcard set */}
          <Route path="/create" element={<CreateFlashcardSetPage />} />
          
          {/* Route for user account settings */}
          <Route path="/settings" element={<Settings />} />
          
          {/* Route to take a test for a specific flashcard set */}
          <Route path="/test/:setId" element={<FlashcardTestPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
