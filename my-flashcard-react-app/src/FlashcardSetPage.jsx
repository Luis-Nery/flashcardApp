import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from './firebaseConfiguration';
import './FlashcardSetPage.css';
import { FaTrashAlt, FaPlus } from 'react-icons/fa';

const FlashcardSetPage = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardSetTitle, setFlashcardSetTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  // States for editing title and flashcards
  const [editingTitle, setEditingTitle] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [editingFlashcardId, setEditingFlashcardId] = useState(null);
  const [updatedQuestion, setUpdatedQuestion] = useState('');
  const [updatedAnswer, setUpdatedAnswer] = useState('');

  // State for delete confirmation
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteFlashcardId, setDeleteFlashcardId] = useState(null);

  // State for delete status (success or failure)
  const [deleteStatus, setDeleteStatus] = useState(null); // null, 'success', or 'failed'

  useEffect(() => {
    const fetchFlashcardsAndTitle = async (userIdToken) => {
      try {
        const setTitleResponse = await axios.get(
          `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}`,
          { headers: { Authorization: `Bearer ${userIdToken}` } }
        );
        setFlashcardSetTitle(setTitleResponse.data.title);
        setUpdatedTitle(setTitleResponse.data.title);

        const flashcardsResponse = await axios.get(
          `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/flashcards`,
          { headers: { Authorization: `Bearer ${userIdToken}` } }
        );

        let flashcardsData = flashcardsResponse.data;
        if (sortAlphabetically) {
          flashcardsData = flashcardsData.sort((a, b) =>
            a.question.localeCompare(b.question)
          );
        }
        setFlashcards(flashcardsData);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch flashcards or flashcard set title');
      } finally {
        setLoading(false);
      }
    };

    const authenticateAndFetchData = () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const userIdToken = await user.getIdToken();
          fetchFlashcardsAndTitle(userIdToken);
        } else {
          navigate('/login');
        }
      });
    };

    authenticateAndFetchData();
  }, [setId, navigate, sortAlphabetically]);

  const deleteFlashcard = async (flashcardId) => {
    try {
      const user = auth.currentUser;
      const userIdToken = await user.getIdToken();
      await axios.delete(
        `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/flashcards/${flashcardId}/removeFlashcard`,
        { 
          headers: { Authorization: `Bearer ${userIdToken}` } 
        }
      );

      setFlashcards((prev) => prev.filter((flashcard) => flashcard.id !== flashcardId));
      setDeleteStatus('success'); // Set delete status to success
    } catch (err) {
      setError('Failed to delete flashcard');
      console.error(err);
      setDeleteStatus('failed'); // Set delete status to failed
    } finally {
      setTimeout(() => {
        setShowDeletePopup(false);
        setDeleteFlashcardId(null);
        setDeleteStatus(null); // Reset status after closing the popup
      }, 2000); // Wait 2 seconds before closing the popup
    }
  };

  const confirmDeleteFlashcard = (flashcardId) => {
    setDeleteFlashcardId(flashcardId);
    setDeleteStatus(null); // Reset delete status for new confirmation
    setShowDeletePopup(true);
  };

  const addNewFlashcard = async () => {
    const newFlashcard = {
      question: '',
      answer: '',
    };

    try {
      const user = auth.currentUser;
      const userIdToken = await user.getIdToken();

      const response = await axios.post(
        `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/addFlashcard`,
        newFlashcard,
        { headers: { Authorization: `Bearer ${userIdToken}` } }
      );

      setFlashcards((prevFlashcards) => [...prevFlashcards, response.data]);
      setEditingFlashcardId(response.data.id);
      setUpdatedQuestion('');
      setUpdatedAnswer('');
    } catch (err) {
      setError('Failed to add new flashcard');
      console.error(err);
    }
  };

  const toggleSort = () => setSortAlphabetically((prev) => !prev);

  const handleEditTitle = () => {
    setEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    try {
      const user = auth.currentUser;
      const userIdToken = await user.getIdToken();
      await axios.put(
        `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/updateTitle`,
        { title: updatedTitle },
        { headers: { Authorization: `Bearer ${userIdToken}` } }
      );

      setFlashcardSetTitle(updatedTitle);
      setEditingTitle(false);
    } catch (err) {
      setError('Failed to save title changes');
    }
  };

  const handleCancelTitleEdit = () => {
    setUpdatedTitle(flashcardSetTitle);
    setEditingTitle(false);
  };

  const handleEditFlashcard = (flashcard) => {
    setEditingFlashcardId(flashcard.id);
    setUpdatedQuestion(flashcard.question);
    setUpdatedAnswer(flashcard.answer);
  };

  const handleSaveFlashcardChanges = async (flashcardId) => {
    try {
      const user = auth.currentUser;
      const userIdToken = await user.getIdToken();
      await axios.put(
        `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/flashcards/${flashcardId}/updateQuestionAndAnswer`,
        { question: updatedQuestion, answer: updatedAnswer },
        { headers: { Authorization: `Bearer ${userIdToken}` } }
      );

      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((flashcard) =>
          flashcard.id === flashcardId
            ? { ...flashcard, question: updatedQuestion, answer: updatedAnswer }
            : flashcard
        )
      );
      setEditingFlashcardId(null);
    } catch (err) {
      setError('Failed to save flashcard changes');
    }
  };

  const handleCancelFlashcardEdit = () => {
    setEditingFlashcardId(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flashcard-set-page">
      <div className="flashcard-set-header">
        {editingTitle ? (
          <div className="flashcard-set-title">
            <input
              type="text"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
              className="edit-title-input"
            />
            <div>
              <button onClick={handleSaveTitle}>Save</button>
              <button onClick={handleCancelTitleEdit}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flashcard-set-title">
            <span>Current Set: {flashcardSetTitle || 'Untitled Set'}</span>
            <button onClick={handleEditTitle}>Edit Title</button>
          </div>
        )}
      </div>

      <button className="sort-button" onClick={toggleSort}>
        {sortAlphabetically ? 'Sort by Default' : 'Sort Alphabetically'}
      </button>
      {flashcards.map((flashcard) => (
        <div className="flashcard" key={flashcard.id}>
          <div className="flashcard-header">
            <h3>Question: {flashcard.question}</h3>
            <div>
              <button className="edit-button" onClick={() => handleEditFlashcard(flashcard)}>
                Edit
              </button>
              <button
                className="delete-button"
                onClick={() => confirmDeleteFlashcard(flashcard.id)}
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
          {editingFlashcardId === flashcard.id ? (
            <div>
              <textarea
                value={updatedQuestion}
                onChange={(e) => setUpdatedQuestion(e.target.value)}
              />
              <textarea
                value={updatedAnswer}
                onChange={(e) => setUpdatedAnswer(e.target.value)}
              />
              <button onClick={() => handleSaveFlashcardChanges(flashcard.id)}>Save</button>
              <button onClick={handleCancelFlashcardEdit}>Cancel</button>
            </div>
          ) : (
            <p>Answer: {flashcard.answer}</p>
          )}
        </div>
      ))}
      <button className="add-button" onClick={addNewFlashcard}>
        <FaPlus /> 
      </button>

      {showDeletePopup && (
        <div className="delete-popup">
          {deleteStatus === null ? (
            <div className='delete-popup-card'>
              <p>Are you sure you want to delete this flashcard?</p>
              <button onClick={() => deleteFlashcard(deleteFlashcardId)}>Delete</button>
              <button onClick={() => setShowDeletePopup(false)}>Cancel</button>
            </div>
          ) : deleteStatus === 'success' ? (
            <div className='delete-popup-card-success'>
            <p>Flashcard deleted successfully!</p>
            </div>
          ) : (
            <div className='delete-popup-card-failed'>
            <p>Failed to delete flashcard. Please try again.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardSetPage;
