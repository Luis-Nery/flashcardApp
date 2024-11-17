import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfiguration'; // Correct import for auth
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'; // Explicit import for EmailAuthProvider and reauthenticateWithCredential
import axios from 'axios'; // Import axios for making HTTP requests
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './Settings.css';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailUpdateSuccess, setEmailUpdateSuccess] = useState('');
  const [deleteAccountError, setDeleteAccountError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setEmail(user.email);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEmailChange = async () => {
    if (newEmail && newEmail !== email) {
      try {
        await auth.currentUser.updateEmail(newEmail);
        setEmail(newEmail);
        setEmailUpdateSuccess('Email updated successfully!');
        setNewEmail('');
      } catch (err) {
        console.error('Error updating email:', err);
        setEmailUpdateSuccess('Failed to update email');
      }
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmation === 'DELETE') {
      try {
        setIsDeleting(true);

        const user = auth.currentUser;
        if (!user) {
          setDeleteAccountError('No user is currently logged in.');
          setIsDeleting(false);
          return;
        }

        // Reauthenticate the user before deletion using email and password
        const credential = EmailAuthProvider.credential(user.email, password); // Use EmailAuthProvider explicitly
        await reauthenticateWithCredential(user, credential); // Correct use of reauthenticateWithCredential method


        // Call backend API to delete the user from the database
        await axios.delete(`http://localhost:8080/api/users/delete/${user.uid}`, {
          headers: {
            Authorization: `Bearer ${user.uid}` // Send Firebase token for authentication
          }
        });
        await user.delete(); // Delete the user account from Firebase


        alert('Your account has been deleted.');
        navigate("/login"); // Use navigate for redirect after deletion
      } catch (err) {
        console.error('Error deleting account:', err);
        if (err.code === 'auth/requires-recent-login') {
          setDeleteAccountError('Please log in again to delete your account.');
        } else {
          setDeleteAccountError('Error deleting account. Please try again.');
        }
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <div className="settings-section">
        <h3>Email Address</h3>
        <p>Current Email: {email}</p>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Enter new email"
        />
        <button onClick={handleEmailChange}>Change Email</button>
        {emailUpdateSuccess && <p className="success-message">{emailUpdateSuccess}</p>}
      </div>

      <div className="settings-section">
        <h3>Delete Account</h3>
        <p>Once you delete your account, there is no going back.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password to confirm"
        />
        <input
          type="text"
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
          placeholder="Type 'DELETE' to confirm"
        />
        <button
          onClick={handleAccountDeletion}
          disabled={isDeleting || deleteConfirmation !== 'DELETE'}
        >
          {isDeleting ? 'Deleting...' : 'Delete Account'}
        </button>
        {deleteAccountError && <p className="error-message">{deleteAccountError}</p>}
      </div>
    </div>
  );
};

export default Settings;
