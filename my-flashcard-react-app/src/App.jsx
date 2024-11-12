import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import AuthForm from './AuthForm';  // Your AuthorizationForm
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthForm/>} />
        <Route path="/signup" element={<AuthForm />} />
      </Routes>
    </Router>
  );
};

export default App;
