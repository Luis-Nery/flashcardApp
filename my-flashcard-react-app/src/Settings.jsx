import React, { useState, useEffect } from 'react';  
import { auth } from './firebaseConfiguration'; // Imports Firebase authentication configuration  
import { EmailAuthProvider, reauthenticateWithCredential, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth'; // Imports Firebase authentication methods  
import axios from 'axios'; // Imports axios for HTTP requests  
import { useNavigate } from 'react-router-dom'; // Imports navigation hook from React Router  
import './Settings.css'; // Imports associated CSS for styling  

const Settings = () => {  
  // State variables for handling form inputs and UI states  
  const [email, setEmail] = useState('');  
  const [deleteConfirmation, setDeleteConfirmation] = useState('');  
  const [password, setPassword] = useState('');  
  const [isDeleting, setIsDeleting] = useState(false);  
  const [deleteAccountError, setDeleteAccountError] = useState('');  
  const [loading, setLoading] = useState(true);  

  const navigate = useNavigate(); // Initializes navigation for redirecting  

  // Effect hook to manage user state on mount  
  useEffect(() => {  
    const unsubscribe = auth.onAuthStateChanged(user => {  
      if (user) {  
        setEmail(user.email); // Sets email if user is authenticated  
        setLoading(false);  
      } else {  
        setLoading(false); // Stops loading if no user is authenticated  
      }  
    });  
    return () => unsubscribe(); // Cleanup listener on component unmount  
  }, []);  

  // Function to handle account deletion  
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

        const providerId = user.providerData[0]?.providerId; // Checks user's authentication provider  

        if (providerId === 'password') {  
          if (!password) {  
            setDeleteAccountError('Please provide your password.');  
            setIsDeleting(false);  
            return;  
          }  
          const credential = EmailAuthProvider.credential(user.email, password);  
          await reauthenticateWithCredential(user, credential); // Reauthenticates with email/password  
        } else if (providerId === 'google.com') {  
          const googleProvider = new GoogleAuthProvider();  
          await reauthenticateWithPopup(user, googleProvider); // Reauthenticates with Google  
        } else {  
          throw new Error('Unsupported provider for reauthentication.');  
        }  

        // Backend API call to remove user from the database  
        await axios.delete(`http://localhost:8080/api/users/delete/${user.uid}`, {  
          headers: {  
            Authorization: `Bearer ${user.uid}`, // Sends Firebase token for validation  
          },  
        });  

        await user.delete(); // Deletes Firebase user account  
        alert('Your account has been deleted.');  
        navigate('/login'); // Redirects user to the login page  
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

  // Display loading spinner until user state is determined  
  if (loading) {  
    return <div>Loading...</div>;  
  }  

  return (  
    <div className="settings-container">  
      <h2>Settings</h2>  
      <div className="settings-section">  
        <h3>Delete Account</h3>  
        <p>Once you delete your account, there is no going back.</p>  
        {email && <p>Signed in as: {email}</p>}  
        <input  
          type="password"  
          value={password}  
          onChange={(e) => setPassword(e.target.value)}  
          placeholder="Enter your password to confirm"  
          disabled={auth.currentUser?.providerData[0]?.providerId !== 'password'}  
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
