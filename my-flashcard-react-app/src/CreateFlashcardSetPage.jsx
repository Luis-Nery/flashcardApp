import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from './firebaseConfiguration';
import './CreateFlashcardSetPage.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom


const CreateFlashcardSetPage = ({ userId }) => {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [title, setTitle] = useState('');
  const [flashcards, setFlashcards] = useState([{ question: '', answer: '' }]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleTitleChange = (e) => setTitle(e.target.value);

  const handleFlashcardChange = (index, field, value) => {
    const newFlashcards = [...flashcards];
    newFlashcards[index][field] = value;
    setFlashcards(newFlashcards);
  };

  const addFlashcard = () => {
    setFlashcards([...flashcards, { question: '', answer: '' }]);
  };

  const removeFlashcard = (index) => {
    const newFlashcards = flashcards.filter((_, i) => i !== index);
    setFlashcards(newFlashcards);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
  
        // API call to create a new flashcard set
        const response = await axios.post(
          `http://localhost:8080/api/users/${userId}/flashcardSets/create`,
          {
            title,
            flashcards,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        setTitle('');
        setFlashcards([{ question: '', answer: '' }]);
        setSuccessMessage('Flashcard set created successfully!');
  
        // Wait 2-3 seconds before redirecting
        setTimeout(() => {
          navigate('/flashcardSetList');
        }, 1500); // 1500ms = 1.5 seconds
      } else {
        setError('User is not authenticated');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to create flashcard set');
    }
  };
  

  const handleTextareaResize = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach((textarea) => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [flashcards]);

  return (
    <div className="create-flashcard-set-page">
      <h2>Create Flashcard Set</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Set Title:
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter flashcard set title"
            required
          />
        </label>

        <h3>Flashcards</h3>
        {flashcards.map((flashcard, index) => (
          <div key={index} className="flashcard-input">
            <div className="flashcard-header">
              <button
                type="button"
                className="remove-flashcard-button"
                onClick={() => removeFlashcard(index)}
              >
                ✖
              </button>
            </div>

            <div className="question">
              <label>Question:</label>
              <textarea
                value={flashcard.question}
                onChange={(e) => handleFlashcardChange(index, 'question', e.target.value)}
                placeholder="Enter question"
                required
                onInput={handleTextareaResize}
              />
            </div>

            <div className="answer">
              <label>Answer:</label>
              <textarea
                value={flashcard.answer}
                onChange={(e) => handleFlashcardChange(index, 'answer', e.target.value)}
                placeholder="Enter answer"
                required
                onInput={handleTextareaResize}
              />
            </div>
          </div>
        ))}

        <button type="button" onClick={addFlashcard} className="add-flashcard-button">+ Add Flashcard</button>
        <button type="submit" className="submit-button">Create Set</button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default CreateFlashcardSetPage;
