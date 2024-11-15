import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from './firebaseConfiguration';
import './FlashcardSetPage.css';

const FlashcardSetPage = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardSetTitle, setFlashcardSetTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  // State for editing title
  const [editingTitle, setEditingTitle] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState('');

  // State for editing flashcards
  const [editingFlashcardId, setEditingFlashcardId] = useState(null);
  const [updatedQuestion, setUpdatedQuestion] = useState('');
  const [updatedAnswer, setUpdatedAnswer] = useState('');

  useEffect(() => {
    const fetchFlashcardsAndTitle = async (userIdToken) => {
      try {
        const setTitleResponse = await axios.get(
          `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}`,
          { headers: { Authorization: `Bearer ${userIdToken}` } }
        );
        setFlashcardSetTitle(setTitleResponse.data.title);
        setUpdatedTitle(setTitleResponse.data.title); // Set initial value for updated title

        const flashcardsResponse = await axios.get(
          `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/flashcards`,
          { headers: { Authorization: `Bearer ${userIdToken}` } }
        );

        let flashcardsData = flashcardsResponse.data;
        if (sortAlphabetically) {
          flashcardsData = flashcardsData.sort((a, b) => a.question.localeCompare(b.question));
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
          try {
            const userIdToken = await user.getIdToken();
            fetchFlashcardsAndTitle(userIdToken);
          } catch {
            setError('Failed to retrieve authentication token');
          }
        } else {
          navigate('/login');
        }
      });
    };

    authenticateAndFetchData();
  }, [setId, navigate, sortAlphabetically]);

  const toggleSort = () => setSortAlphabetically((prev) => !prev);

  const handleEditTitle = () => {
    setEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    try {
      const user = auth.currentUser;
      const userIdToken = await user.getIdToken();
      
      const updatedTitleData = { title: updatedTitle };
      await axios.put(
        `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/updateTitle`,
        updatedTitleData,
        { headers: { Authorization: `Bearer ${userIdToken}` } }
      );
      
      // Update the title locally
      setFlashcardSetTitle(updatedTitle);
      setEditingTitle(false); // Exit edit mode
    } catch (err) {
      setError('Failed to save title changes');
    }
  };

  const handleCancelTitleEdit = () => {
    setUpdatedTitle(flashcardSetTitle); // Revert to original title
    setEditingTitle(false); // Exit edit mode
  };

  const handleEditClick = (flashcard) => {
    setEditingFlashcardId(flashcard.id);
    setUpdatedQuestion(flashcard.question);
    setUpdatedAnswer(flashcard.answer);
  };

  const handleSaveChanges = async (flashcardId) => {
    try {
      const user = auth.currentUser;
      const userIdToken = await user.getIdToken();
      
      const updatedFlashcard = { question: updatedQuestion, answer: updatedAnswer };
      await axios.put(
        `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/flashcards/${flashcardId}/updateQuestionAndAnswer`,
        updatedFlashcard,
        { headers: { Authorization: `Bearer ${userIdToken}` } }
      );
      
      // Update the flashcard in the local state
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((flashcard) =>
          flashcard.id === flashcardId
            ? { ...flashcard, question: updatedQuestion, answer: updatedAnswer }
            : flashcard
        )
      );
      
      // Reset the editing state
      setEditingFlashcardId(null);
    } catch (err) {
      setError('Failed to save changes');
    }
  };

  const handleCancelEdit = () => {
    setEditingFlashcardId(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flashcard-set-page">
      <div className="flashcard-set-header">
        {editingTitle ? (
          <div>
            <input
              type="text"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
            />
            <button onClick={handleSaveTitle}>Save</button>
            <button onClick={handleCancelTitleEdit}>Cancel</button>
          </div>
        ) : (
          <h2>
            Current Set: {flashcardSetTitle || 'Unknown'} 
            <button onClick={handleEditTitle} className="edit-title-button">Edit Title</button>
          </h2>
        )}
      </div>
      <button className="sort-button" onClick={toggleSort}>
        {sortAlphabetically ? 'Sort by Default' : 'Sort Alphabetically'}
      </button>
      {flashcards.map((flashcard) => (
        <div className="flashcard" key={flashcard.id}>
          <div className="flashcard-header">
            <h3>Question: {flashcard.question}</h3>
            <button
              className="edit-button"
              onClick={() => handleEditClick(flashcard)}
            >
              Edit
            </button>
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
              <button onClick={() => handleSaveChanges(flashcard.id)}>Save</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>
          ) : (
            <p>Answer: {flashcard.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default FlashcardSetPage;
