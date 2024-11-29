import React, { useState, useEffect } from 'react'; 
// Imports React and React hooks 'useState' and 'useEffect' for managing state and side effects.

import './LandingPage.css'; 
// Imports the CSS file for styling the LandingPage component.

import { Link } from 'react-router-dom'; 
// Imports 'Link' from 'react-router-dom' for client-side navigation.

import heroImage from './assets/heroImage.jpg'; 
// Imports the hero section image.

import createImage from './assets/createImage.jpg'; 
import storeImage from './assets/storeImage.jpg'; 
import testingImage from './assets/testingImage.jpg'; 
// Imports feature section images.

const LandingPage = () => { 
// Defines the 'LandingPage' functional component.

const quotes = [
  '"Education is the most powerful weapon which you can use to change the world." – Nelson Mandela',
  '"An investment in knowledge pays the best interest." – Benjamin Franklin',
  '"The beautiful thing about learning is that no one can take it away from you." – B.B. King',
  '"Live as if you were to die tomorrow. Learn as if you were to live forever." – Mahatma Gandhi',
  '"The more that you read, the more things you will know. The more that you learn, the more places you’ll go." – Dr. Seuss',
  '"Learning is not attained by chance; it must be sought for with ardor and attended to with diligence." – Abigail Adams',
  '"Develop a passion for learning. If you do, you will never cease to grow." – Anthony J. D’Angelo',
  '"Education is the key to unlocking the world, a passport to freedom." – Oprah Winfrey',
  '"Success is the sum of small efforts, repeated day in and day out." – Robert Collier',
  '"You don’t have to be great to start, but you have to start to be great." – Zig Ziglar',
  '"The expert in anything was once a beginner." – Helen Hayes',
  '"The mind is not a vessel to be filled but a fire to be kindled." – Plutarch',
  '"Don’t let what you cannot do interfere with what you can do." – John Wooden',
  '"It always seems impossible until it’s done." – Nelson Mandela',
  '"Motivation is what gets you started. Habit is what keeps you going." – Jim Ryun',
  '"Study without desire spoils the memory, and it retains nothing that it takes in." – Leonardo da Vinci',
  '"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice." – Brian Herbert',
  '"Success doesn’t come from what you do occasionally, it comes from what you do consistently." – Marie Forleo',
  '"Education’s purpose is to replace an empty mind with an open one." – Malcolm Forbes',
  '"The only way to achieve the impossible is to believe it is possible." – Charles Kingsleigh',
  '"You are never too old to set another goal or to dream a new dream." – C.S. Lewis',
  '"Learning never exhausts the mind." – Leonardo da Vinci',
  '"If you are not willing to learn, no one can help you. If you are determined to learn, no one can stop you." – Zig Ziglar',
  '"Teachers can open the door, but you must enter it yourself." –Proverb',
  '"Wisdom is not a product of schooling but of the lifelong attempt to acquire it." – Albert Einstein',
];
  // An array of quotes, intended to store motivational quotes. 

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0); 
  // Initializes state for tracking the current quote index.

  useEffect(() => { 
  // Sets up a side effect to cycle through quotes using a timer.
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length); 
      // Cycles to the next quote, resetting to the first when the end is reached.
    }, 6000); 
    // Changes the quote every 6000 milliseconds (6 seconds).

    return () => clearInterval(interval); 
    // Cleans up the interval when the component is unmounted to prevent memory leaks.
  }, [quotes.length]); 
  // The effect depends on 'quotes.length', meaning it will run again if the length changes.

  return (
    <div className="landing-page"> 
    {/* Main container for the landing page content. */}
      <header className="header">
        <div className="logo">
          <h1>Your Flashcard App</h1> 
          {/* Displays the application name. */}
        </div>
        <nav className="navigation">
          <ul>
            <li className="login-button">
              <Link to="/login">Login</Link> 
              {/* Link to the login page. */}
            </li>
            <li className="signup-button">
              <Link to="/signup">Sign Up</Link> 
              {/* Link to the sign-up page. */}
            </li>
          </ul>
        </nav>
      </header>

      <section className="hero"> 
      {/* Hero section with a promotional message and image. */}
        <div className="hero-content">
          <h2>Study Smarter, Not Harder</h2>
          <p>
            Start creating and studying flashcards to boost your learning efficiency. Whether you're a student or a professional, our app helps you
            retain knowledge more effectively.
          </p>
          <Link to="/signup" className="cta-button">
            Get Started
          </Link> 
          {/* Call-to-action button leading to the sign-up page. */}
        </div>
        <div className="hero-image">
          <img
            src={heroImage}
            alt="Hero section placeholder" 
            // Alt text for accessibility.
          />
        </div>
      </section>

      <section className="quote-slider"> 
      {/* Section for displaying a rotating set of quotes. */}
        {quotes.map((quote, index) => (
          <p
            key={index}
            className={index === currentQuoteIndex ? 'active' : ''} 
            // Applies 'active' class to the currently displayed quote.
          >
            {quote} 
            {/* Displays each quote from the array. */}
          </p>
        ))}
      </section>

      <section className="features"> 
      {/* Section highlighting the app's features. */}
        <div className="feature">
          <h3>Create Flashcards</h3>
          <img
            src={createImage}
            alt="Create Flashcards placeholder" 
            // Describes the "Create Flashcards" feature image.
          />
          <p>Effortlessly create and organize your own flashcards for any subject.</p>
        </div>
        <div className="feature">
          <h3>Store Flashcards</h3>
          <img
            src={storeImage}
            alt="Store Flashcards placeholder" 
            // Describes the "Store Flashcards" feature image.
          />
          <p>Come back anytime to your saved flashcards to continue learning!</p>
        </div>
        <div className="feature">
          <h3>Test Yourself</h3>
          <img
            src={testingImage}
            alt="Test Yourself placeholder" 
            // Describes the "Test Yourself" feature image.
          />
          <p>A faster learning mode that helps you identify your rights and wrongs.</p>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 Your Flashcard App. All rights reserved.</p> 
        {/* Displays copyright information. */}
      </footer>
    </div>
  );
};

export default LandingPage; 
// Exports the component for use in other parts of the application.
