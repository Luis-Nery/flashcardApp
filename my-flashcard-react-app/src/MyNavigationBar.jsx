import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from './firebaseConfiguration';
import './MyNavigationBar.css';

const MyNavigationBar = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/'); // Redirect to the login page after signing out
    } catch (err) {
      console.error("Error signing out: ", err);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/flashcardSetList" className="navbar-title">Flashcard App</Link>
      <div className="navbar-actions">
        <button className="create-button" onClick={() => navigate('/create')}>
          + Create
        </button>
        <div className="profile-container">
          <div className="profile-icon" onClick={toggleDropdown}>
            {/* Profile Icon (e.g., initials or user image) */}
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={() => navigate('/settings')}>Settings</button>
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MyNavigationBar;
