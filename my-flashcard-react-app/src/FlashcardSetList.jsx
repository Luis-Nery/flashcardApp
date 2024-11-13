// FlashcardSetList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from './firebaseConfiguration.js';
import { Link } from 'react-router-dom';


const FlashcardSetList = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
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
    fetchFlashcardSets();
  }, []);

  if (loading) return <p>Loading flashcard sets...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Your Flashcard Sets</h2>
      <ul>
       
        {flashcardSets.map((set) => (
             <Link to = {`/flashcardSet/${set.id}`} key={set.id}>
          <li key={set.id}>{set.title}</li> 
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default FlashcardSetList;
