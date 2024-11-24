import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from './firebaseConfiguration';
import './FlashcardTestPage.css';

const FlashcardTestPage = () => {
  const { setId } = useParams(); // Get flashcard set ID from route params
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [answers, setAnswers] = useState([]); // Store user's selected answers
  const [generatedOptions, setGeneratedOptions] = useState([]); // Pre-generated options for each question
  const [score, setScore] = useState(0);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch flashcards when the component mounts
  useEffect(() => {
    const fetchFlashcards = async (userIdToken) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/flashcards`,
          {
            headers: { Authorization: `Bearer ${userIdToken}` },
          }
        );
        setFlashcards(response.data);
        setAnswers(new Array(response.data.length).fill(null)); // Initialize answers array
        setGeneratedOptions(
          response.data.map((flashcard) => generateOptions(flashcard.answer, response.data))
        ); // Pre-generate options for all questions
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch flashcards:', err);
        setError('Unable to fetch flashcards. Please try again later.');
        setLoading(false);
      }
    };

    const authenticateAndFetch = () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const userIdToken = await user.getIdToken();
          if (userIdToken) await fetchFlashcards(userIdToken);
        } else {
          navigate('/login'); // Redirect to login if user is not authenticated
        }
      });
    };

    authenticateAndFetch();
  }, [setId, navigate]);

  // Generate options for a single question
  const generateOptions = (correctAnswer, flashcards) => {
    const allAnswers = flashcards.map((card) => card.answer); // Collect all possible answers
    const options = new Set();
    options.add(correctAnswer);

    while (options.size < Math.min(4, flashcards.length)) {
      const randomAnswer =
        allAnswers[Math.floor(Math.random() * allAnswers.length)];
      options.add(randomAnswer);
    }

    return Array.from(options).sort(() => Math.random() - 0.5); // Randomize options
  };

  // Handle answer selection for a question
  const handleAnswerSelect = (index, selectedOption) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = selectedOption;
    setAnswers(updatedAnswers);
  };

  // Handle test submission
  const handleSubmitTest = () => {
    let calculatedScore = 0;
    answers.forEach((answer, index) => {
      if (answer === flashcards[index]?.answer) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    setIsTestComplete(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (!flashcards.length) return <div>No flashcards available for testing.</div>;

  if (isTestComplete)
    return (
      <div className="test-complete">
        <h2>Test Complete!</h2>
        <p>
          Your score: {score} / {flashcards.length}
        </p>
        <div className="results-list">
          {flashcards.map((flashcard, index) => (
            <div key={index} className="result-question">
              <h3>Question {index + 1}:</h3>
              <p className='flashcard-question'>{flashcard.question}</p>
              <div className="result-options">
                {generatedOptions[index].map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    className={`result-option ${
                      option === flashcard.answer
                        ? 'correct'
                        : answers[index] === option
                        ? 'incorrect'
                        : ''
                    }`}
                    disabled
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate(`/flashcardSet/${setId}`)}>
          Back to Set
        </button>
      </div>
    );

  return (
    <div className="flashcard-test-page">
      <h2>Test Mode</h2>
      <div className="questions-list">
        {flashcards.map((flashcard, index) => (
          <div key={index} className="question-section">
            <h3>Question {index + 1}:</h3>
            <p className='flashcard-question'>{flashcard.question}</p>
            <div className="options-section">
              {generatedOptions[index].map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  className={`option ${
                    answers[index] === option ? 'selected' : ''
                  }`}
                  onClick={() => handleAnswerSelect(index, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
  className="submit-button"
  onClick={handleSubmitTest}
  disabled={answers.includes(null)} // Disable if not all questions are answered
>
  Submit Test
</button>
    </div>
  );
};

export default FlashcardTestPage;
