import React, { useState, useEffect } from 'react';  
// Importing necessary React hooks for state management and lifecycle effects.

import { useNavigate, Link } from 'react-router-dom';  
// Imports for navigation and linking within the React Router.

import { auth } from './firebaseConfiguration';  
// Firebase authentication configuration import for handling user authentication.

import './MyNavigationBar.css';  
// Importing custom CSS for styling the navigation bar.

const MyNavigationBar = () => {  
  const navigate = useNavigate();  
  // React Router hook for programmatic navigation.

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);  
  // State to manage the visibility of the dropdown menu.

  const toggleDropdown = () => {  
    setIsDropdownOpen(!isDropdownOpen);  
    // Toggles the dropdown menu between open and closed states.
  };

  const closeDropdown = () => {  
    setIsDropdownOpen(false);  
    // Closes the dropdown menu.
  };

  const handleSignOut = async () => {  
    try {  
      await auth.signOut();  
      // Asynchronously signs the user out via Firebase authentication.

      closeDropdown();  
      // Closes the dropdown after signing out.

      navigate('/');  
      // Redirects the user to the home page after successful sign-out.

    } catch (err) {  
      console.error('Error signing out: ', err);  
      // Logs any errors that occur during the sign-out process.
    }
  };

  // Effect to handle closing the dropdown when clicking outside of it.
  useEffect(() => {  
    const handleClickOutside = (event) => {  
      if (!event.target.closest('.profile-container')) {  
        // Checks if the click is outside the profile container.
        closeDropdown();  
      }
    };

    if (isDropdownOpen) {  
      document.addEventListener('click', handleClickOutside);  
      // Adds event listener when the dropdown is open.
    } else {  
      document.removeEventListener('click', handleClickOutside);  
      // Removes event listener when the dropdown is closed.
    }

    return () => document.removeEventListener('click', handleClickOutside);  
    // Cleanup to remove the event listener on component unmount.
  }, [isDropdownOpen]);  
  // Dependency array ensures effect runs when `isDropdownOpen` changes.

  return (
    <nav className="navbar">  
      {/* Main navigation bar container. */}

      <Link to="/flashcardSetList" className="navbar-title">  
        Your Flashcard App  
      </Link>  
      {/* Link to the flashcard set list with a custom title styling. */}

      <div className="navbar-actions">  
        {/* Container for navigation actions. */}

        <button className="create-button" onClick={() => navigate('/create')}>  
          + Create  
        </button>  
        {/* Button to navigate to the flashcard creation page. */}

        <div className="profile-container">  
          {/* Profile container holding the hamburger icon and dropdown. */}

          <div className="profile-icon" onClick={toggleDropdown}>  
            {/* Toggles the dropdown when clicked. */}
            <div className="hamburger-icon">  
              {/* Hamburger icon with three bars. */}
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {isDropdownOpen && (  
            /* Conditionally renders the dropdown menu if `isDropdownOpen` is true. */
            <div className="dropdown-menu">  
              <button onClick={() => { closeDropdown(); navigate('/settings'); }}>  
                Settings  
              </button>  
              {/* Button to navigate to the settings page. */}

              <button onClick={handleSignOut}>Sign Out</button>  
              {/* Button to sign the user out of the application. */}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MyNavigationBar;  
// Exporting the component for use in other parts of the application.
