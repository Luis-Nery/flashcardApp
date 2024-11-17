import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from './firebaseConfiguration.js';
import { useNavigate } from 'react-router-dom';
import './FlashcardSetList.css';

const FlashcardSetList = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteSetId, setDeleteSetId] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlashcardSets = async (token) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/users/${token}/flashcardSets`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFlashcardSets(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch flashcard sets');
      } finally {
        setLoading(false);
      }
    };

    const checkAuthAndFetch = () => {
      const user = auth.currentUser;
      if (user) {
        user
          .getIdToken()
          .then(fetchFlashcardSets)
          .catch((err) => {
            console.error('Token retrieval error:', err);
            setError('Failed to retrieve authentication token');
            setLoading(false);
          });
      } else {
        navigate('/login');
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAuthAndFetch();
      } else {
        setLoading(false);
        setError('User not authenticated');
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleDeleteClick = (event, setId) => {
    event.stopPropagation();
    setShowDeletePopup(true);
    setDeleteSetId(setId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSetId) return;

    try {
      const user = auth.currentUser;

      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const token = await user.getIdToken();
      const userId = user.uid; // Get userId from the Firebase auth user

      // Send DELETE request with userId and setId in the URL
      await axios.delete(
        `http://localhost:8080/api/users/${userId}/flashcardSets/${deleteSetId}/removeFlashcardSet`, // Updated endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token for authentication
          },
        }
      );

      // Remove the deleted set from the local state
      setFlashcardSets((prev) =>
        prev.filter((set) => set.id !== deleteSetId)
      );

      setDeleteSuccessMessage('Flashcard set deleted successfully!');
      setShowDeletePopup(false);

      // Hide the success message after 2 seconds
      setTimeout(() => {
        setDeleteSuccessMessage('');
      }, 2000);
      
      setDeleteSetId(null);
      setDeleteConfirmationText('');
    } catch (err) {
      console.error('Error deleting flashcard set:', err);
    }
  };

  const handlePopupClose = () => {
    setShowDeletePopup(false);
    setDeleteSetId(null);
    setDeleteConfirmationText('');
    setDeleteSuccessMessage('');
  };

  const handleSetClick = (setId) => {
    navigate(`/flashcardSet/${setId}`);
  };

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
            onClick={() => handleSetClick(set.id)}
          >
            <span className="flashcard-title">{set.title}</span>
            <button
              className="delete-button"
              onClick={(e) => handleDeleteClick(e, set.id)}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>

      {showDeletePopup && (
        <div className="delete-popup">
          <div className="popup-content">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete the set {' '}
              <strong>
                " 
                {
                  flashcardSets.find((set) => set.id === deleteSetId)?.title ||
                  'this set'
                }
                "
              </strong>
              ? Type the name of the set below to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type the set name here"
            />
            <div className="popup-actions">
              <button onClick={handlePopupClose}>Cancel</button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmationText !==
                  flashcardSets.find((set) => set.id === deleteSetId)?.title}
              >
                Confirm Delete
              </button>
            </div>
          </div>
          <div className="popup-overlay" onClick={handlePopupClose}></div>
        </div>
      )}

      {deleteSuccessMessage && (
        <div className="delete-success-message">
          {deleteSuccessMessage}
        </div>
      )}
    </div>
  );
};

export default FlashcardSetList;
