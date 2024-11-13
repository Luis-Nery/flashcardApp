import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from './firebaseConfiguration';

const FlashcardSetPage = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortAlphabetically, setSortAlphabetically] = useState(false); // State for toggling sort

  useEffect(() => {
    const fetchFlashcards = async (userIdToken) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/flashcards`,
          { headers: { Authorization: `Bearer ${userIdToken}` } }
        );

        // Optionally sort flashcards based on the state
        let flashcardsData = response.data;
        if (sortAlphabetically) {
          flashcardsData = flashcardsData.sort((a, b) => {
            if (a.question < b.question) return -1;
            if (a.question > b.question) return 1;
            return 0;
          });
        }

        setFlashcards(flashcardsData);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch flashcards');
      } finally {
        setLoading(false);
      }
    };

    const authenticateAndFetchData = () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const userIdToken = await user.getIdToken();
            fetchFlashcards(userIdToken);
          } catch (tokenError) {
            setError('Failed to retrieve authentication token');
          }
        } else {
          navigate('/login'); // Redirect to login if not authenticated
        }
      });
    };

    authenticateAndFetchData();
  }, [setId, navigate, sortAlphabetically]); // Add sortAlphabetically as a dependency

  const toggleSort = () => {
    setSortAlphabetically((prev) => !prev); // Toggle the sorting order
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <button onClick={handleGoBack}>Back</button> {/* Back button */}
      <h2>Flashcards in Set {setId}</h2>
      <button onClick={toggleSort}>
        {sortAlphabetically ? 'Sort by Default' : 'Sort Alphabetically'}
      </button>
      {flashcards.map((flashcard) => (
        <div key={flashcard.id}>
          <h3>{flashcard.question}</h3>
          <p>{flashcard.answer}</p>
        </div>
      ))}
    </div>
  );
};

export default FlashcardSetPage;
