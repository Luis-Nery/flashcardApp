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

  useEffect(() => {
    const fetchFlashcardsAndTitle = async (userIdToken) => {
      try {
        const setTitleResponse = await axios.get(
          `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}`,
          { headers: { Authorization: `Bearer ${userIdToken}` } }
        );
        setFlashcardSetTitle(setTitleResponse.data.title);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flashcard-set-page">
      <h2>Current Set: {flashcardSetTitle || 'Unknown'}</h2>
      <button className="sort-button" onClick={toggleSort}>
        {sortAlphabetically ? 'Sort by Default' : 'Sort Alphabetically'}
      </button>
      {flashcards.map((flashcard) => (
        <div className="flashcard" key={flashcard.id}>
          <h3>Question: {flashcard.question}</h3>
          <p>Answer: {flashcard.answer}</p>
        </div>
      ))}
    </div>
  );
};

export default FlashcardSetPage;
