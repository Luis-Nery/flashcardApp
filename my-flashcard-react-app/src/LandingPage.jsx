import React from 'react';
import './LandingPage.css';
import { Link } from 'react-router-dom'; // Assuming you are using react-router for navigation

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo">
          <h1>Your Flashcard App</h1>
        </div>
        <nav className="navigation">
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <h2>Study Smarter, Not Harder</h2>
        <p>Start creating and sharing flashcards to boost your learning efficiency. Whether you're a student or a professional, our app helps you retain knowledge more effectively.</p>
        <Link to="/signup" className="cta-button">Get Started</Link>
      </section>

      <section className="features">
        <div className="feature">
          <h3>Create Flashcards</h3>
          <p>Effortlessly create and organize your own flashcards for any subject.</p>
        </div>
        <div className="feature">
          <h3>Share with Friends</h3>
          <p>Collaborate with friends by sharing your flashcard sets to study together.</p>
        </div>
        <div className="feature">
          <h3>Track Progress</h3>
          <p>Keep track of your progress and improve over time with helpful study statistics.</p>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 Your Flashcard App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
