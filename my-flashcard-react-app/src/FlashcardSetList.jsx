import React, { useEffect, useState } from 'react'; // Importing necessary hooks from React
import axios from 'axios'; // Importing axios for making API requests
import { auth } from './firebaseConfiguration.js'; // Importing Firebase authentication instance
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation
import './FlashcardSetList.css'; // Importing styles for the component

const FlashcardSetList = () => {
  const [flashcardSets, setFlashcardSets] = useState([]); // State to hold the list of flashcard sets
  const [loading, setLoading] = useState(true); // State to track loading status
  const [error, setError] = useState(''); // State to store error messages
  const [showDeletePopup, setShowDeletePopup] = useState(false); // State to control visibility of delete confirmation popup
  const [deleteSetId, setDeleteSetId] = useState(null); // State to hold the id of the set to be deleted
  const [deleteConfirmationText, setDeleteConfirmationText] = useState(''); // State for delete confirmation text
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState(''); // State for success message after deletion
  const navigate = useNavigate(); // useNavigate hook for page redirection

  useEffect(() => {
    // Function to fetch flashcard sets from the backend API
    const fetchFlashcardSets = async (token) => {
      try {
        // Make GET request to fetch flashcard sets with the token for authentication
        const response = await axios.get(
          `http://localhost:8080/api/users/${token}/flashcardSets`,
          {
            headers: { Authorization: `Bearer ${token}` }, // Include token in headers for authorization
          }
        );
        setFlashcardSets(response.data); // Set the fetched flashcard sets to state
      } catch (err) {
        console.error(err); // Log errors
        setError('Failed to fetch flashcard sets'); // Set error message if request fails
      } finally {
        setLoading(false); // Set loading to false once data fetching is complete
      }
    };

    // Function to check authentication status and fetch flashcard sets if authenticated
    const checkAuthAndFetch = () => {
      const user = auth.currentUser; // Get the current authenticated user
      if (user) {
        user
          .getIdToken() // Get the authentication token for the current user
          .then(fetchFlashcardSets) // Fetch flashcard sets if token retrieval is successful
          .catch((err) => {
            console.error('Token retrieval error:', err); // Handle token retrieval errors
            setError('Failed to retrieve authentication token'); // Set error message if token retrieval fails
            setLoading(false);
          });
      } else {
        navigate('/login'); // Navigate to login page if no user is authenticated
      }
    };

    // Subscribe to authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAuthAndFetch(); // Fetch flashcard sets if user is authenticated
      } else {
        setLoading(false); // Stop loading if user is not authenticated
        setError('User not authenticated'); // Set error message for unauthenticated user
        navigate('/login'); // Redirect to login page
      }
    });

    return () => unsubscribe(); // Cleanup function to unsubscribe from the auth state change listener
  }, [navigate]); // Dependency array ensures effect runs once on mount and when navigate changes

  // Handler for delete button click
  const handleDeleteClick = (event, setId) => {
    event.stopPropagation(); // Prevent click event from bubbling up
    setShowDeletePopup(true); // Show delete confirmation popup
    setDeleteSetId(setId); // Set the ID of the flashcard set to be deleted
  };

  // Handler for delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteSetId) return; // Prevent further action if no set ID is provided

    try {
      const user = auth.currentUser; // Get the current authenticated user

      if (!user) {
        console.error('User not authenticated'); // Log error if no user is authenticated
        return;
      }

      const token = await user.getIdToken(); // Get the authentication token for the current user
      const userId = user.uid; // Get the user ID from Firebase

      // Send DELETE request to backend API to remove the flashcard set
      await axios.delete(
        `http://localhost:8080/api/users/${userId}/flashcardSets/${deleteSetId}/removeFlashcardSet`, // DELETE endpoint for removing a set
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token for authentication
          },
        }
      );

      // Remove the deleted set from the local state by filtering it out
      setFlashcardSets((prev) =>
        prev.filter((set) => set.id !== deleteSetId)
      );

      setDeleteSuccessMessage('Flashcard set deleted successfully!'); // Set success message
      setShowDeletePopup(false); // Hide the delete confirmation popup

      // Hide success message after 2 seconds
      setTimeout(() => {
        setDeleteSuccessMessage('');
      }, 2000);
      
      setDeleteSetId(null); // Reset the setId after deletion
      setDeleteConfirmationText(''); // Reset the confirmation text
    } catch (err) {
      console.error('Error deleting flashcard set:', err); // Log any errors that occur during deletion
    }
  };



  const handlePopupClose = () => {
    // Close the delete confirmation popup and reset related states
    setShowDeletePopup(false);
    setDeleteSetId(null);
    setDeleteConfirmationText('');
    setDeleteSuccessMessage('');
  };
  
  const handleSetClick = (setId) => {
    // Navigate to the detailed flashcard set page based on the clicked set ID
    navigate(`/flashcardSet/${setId}`);
  };
  
  // Loading and error states: display loading or error messages if necessary
  if (loading) return <p>Loading flashcard sets...</p>;
  if (error) return <p>{error}</p>;
  
  return (
    <div
      className={`flashcard-set-list-container ${showDeletePopup ? 'disable-pointer-events' : ''}`}
    >
      <h2>Your Flashcard Sets</h2>
      <ul>
        {flashcardSets.map((set) => (
          <li
            key={set.id}
            className="flashcard-item"
            onClick={() => handleSetClick(set.id)} // Handle click to navigate to individual set
          >
            <span className="flashcard-title">{set.title}</span>
            <button
              className="delete-button"
              onClick={(e) => handleDeleteClick(e, set.id)} // Handle click to trigger delete popup
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
  
      {/* Conditional rendering of the delete confirmation popup */}
      {showDeletePopup && (
        <div className="delete-popup">
          <div className="popup-content">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the set {' '}
              <strong>
                "{ 
                flashcardSets.find((set) => set.id === deleteSetId)?.title || 'this set'
                }"
              </strong>
              ? Type the name of the set below to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmationText} // Bind input value to state
              onChange={(e) => setDeleteConfirmationText(e.target.value)} // Update confirmation text on change
              placeholder="Type the set name here"
            />
            <div className="popup-actions">
              <button onClick={handlePopupClose}>Cancel</button>
              <button
                onClick={handleDeleteConfirm} // Trigger delete confirmation
                disabled={deleteConfirmationText !==
                  flashcardSets.find((set) => set.id === deleteSetId)?.title} // Disable if input doesn't match set name
              >
                Confirm Delete
              </button>
            </div>
          </div>
          <div className="popup-overlay" onClick={handlePopupClose}></div> {/* Overlay to close popup on click */}
        </div>
      )}
  
      {/* Show success message after deletion */}
      {deleteSuccessMessage && (
        <div className="delete-success-message">
          {deleteSuccessMessage}
        </div>
      )}
    </div>
  );
  };
  
  export default FlashcardSetList;
  