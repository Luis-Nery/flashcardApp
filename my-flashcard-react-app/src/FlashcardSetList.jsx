import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from './firebaseConfiguration.js';
import { Link, useNavigate } from 'react-router-dom';
import './FlashcardSetList.css';

const FlashcardSetList = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlashcardSets = async (token) => {
      try {
        const response = await axios.get(`http://localhost:8080/api/users/${token}/flashcardSets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
        user.getIdToken().then(fetchFlashcardSets).catch((err) => {
          console.error('Token retrieval error:', err);
          setError('Failed to retrieve authentication token');
          setLoading(false);
        });
      } else {
        // Redirect to login if the user is not authenticated
        navigate('/login');
      }
    };

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAuthAndFetch();
      } else {
        setLoading(false);
        setError('User not authenticated');
        navigate('/login'); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <p>Loading flashcard sets...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flashcard-set-list-container">
      <h2>Your Flashcard Sets</h2>
      <ul>
        {flashcardSets.map((set) => (
          <Link to={`/flashcardSet/${set.id}`} key={set.id} className="flashcard-item">
            <li>{set.title}</li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default FlashcardSetList;
