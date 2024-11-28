import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from './firebaseConfiguration';
import './MyNavigationBar.css';

const MyNavigationBar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      closeDropdown();
      navigate('/'); // Redirect to the login page after signing out
    } catch (err) {
      console.error('Error signing out: ', err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-container')) {
        closeDropdown();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <nav className="navbar">
      <Link to="/flashcardSetList" className="navbar-title">
        Flashcard App
      </Link>
      <div className="navbar-actions">
        <button className="create-button" onClick={() => navigate('/create')}>
          + Create
        </button>
        <div className="profile-container">
          <div className="profile-icon" onClick={toggleDropdown}>
            {/* Hamburger Icon */}
            <div className="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => { closeDropdown(); navigate('/settings'); }}>
                Settings
              </button>
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MyNavigationBar;
