import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from './firebaseConfiguration';
import './FlashcardTestPage.css';

const FlashcardTestPage = () => {
  const { setId } = useParams(); // Retrieve the ID of the flashcard set from the URL parameters.
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]); // Store the list of flashcards.
  const [answers, setAnswers] = useState([]); // Track user's answers for each question.
  const [generatedOptions, setGeneratedOptions] = useState([]); // Store multiple-choice options for each question.
  const [score, setScore] = useState(0); // Track the user's score.
  const [isTestComplete, setIsTestComplete] = useState(false); // Flag to indicate if the test is completed.
  const [error, setError] = useState(null); // Track errors during data fetching or processing.
  const [loading, setLoading] = useState(true); // Indicate whether data is currently being loaded.

  // Fetch flashcards when the component mounts or when `setId` changes.
  useEffect(() => {
    const fetchFlashcards = async (userIdToken) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/flashcards`,
          {
            headers: { Authorization: `Bearer ${userIdToken}` }, // Include the user ID token in the request header.
          }
        );
        setFlashcards(response.data); // Update state with the fetched flashcards.
        setAnswers(new Array(response.data.length).fill(null)); // Initialize an array for user's answers.
        setGeneratedOptions(
          response.data.map((flashcard) => generateOptions(flashcard.answer, response.data))
        ); // Pre-generate multiple-choice options for all questions.
        setLoading(false); // Mark the loading process as complete.
      } catch (err) {
        console.error('Failed to fetch flashcards:', err); // Log the error for debugging purposes.
        setError('Unable to fetch flashcards. Please try again later.'); // Set an error message for user feedback.
        setLoading(false); // Stop the loading indicator.
      }
    };

    const authenticateAndFetch = () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          const userIdToken = await user.getIdToken(); // Get the authenticated user's token.
          if (userIdToken) await fetchFlashcards(userIdToken); // Fetch flashcards using the token.
        } else {
          navigate('/login'); // Redirect to the login page if the user is not authenticated.
        }
      });
    };

    authenticateAndFetch();
  }, [setId, navigate]); // Dependencies to re-run the effect when they change.

  // Generate multiple-choice options for a question.
  const generateOptions = (correctAnswer, flashcards) => {
    const allAnswers = flashcards.map((card) => card.answer); // Collect all answers from the flashcards.
    const options = new Set();
    options.add(correctAnswer); // Ensure the correct answer is included.

    while (options.size < Math.min(4, flashcards.length)) { // Add random options up to the limit of 4 or the total number of flashcards.
      const randomAnswer =
        allAnswers[Math.floor(Math.random() * allAnswers.length)]; // Randomly pick an answer from the list.
      options.add(randomAnswer); // Add it to the set (duplicates are automatically ignored).
    }

    return Array.from(options).sort(() => Math.random() - 0.5); // Shuffle the options before returning.
  };

  // Handle user's selection of an answer for a specific question.
  const handleAnswerSelect = (index, selectedOption) => {
    const updatedAnswers = [...answers]; // Create a copy of the answers array.
    updatedAnswers[index] = selectedOption; // Update the selected answer for the given question index.
    setAnswers(updatedAnswers); // Update the state with the new answers.
  };

  // Calculate the user's score and mark the test as complete.
  const handleSubmitTest = () => {
    let calculatedScore = 0;
    answers.forEach((answer, index) => {
      if (answer === flashcards[index]?.answer) { // Check if the user's answer matches the correct answer.
        calculatedScore++; // Increment the score for each correct answer.
      }
    });
    setScore(calculatedScore); // Update the score state.
    setIsTestComplete(true); // Mark the test as completed.
  };

  if (loading) return <div>Loading...</div>; // Show a loading indicator while fetching data.
  if (error) return <div>{error}</div>; // Display an error message if fetching fails.

  if (!flashcards.length) return <div>No flashcards available for testing.</div>; // Inform the user if there are no flashcards.

  if (isTestComplete) // Check if the test is complete before rendering the result section.
    return (
      <div className="test-complete"> {/* Container for displaying test completion results. */}
        <h2>Test Complete!</h2> {/* Header to indicate the test is finished. */}
        <p>
          Your score: {score} / {flashcards.length} {/* Display the user's score out of total questions. */}
        </p>
        <div className="results-list"> {/* Container for listing results of each question. */}
          {flashcards.map((flashcard, index) => ( // Loop through each flashcard to display its result.
            <div key={index} className="result-question"> {/* Display individual question result. */}
              <h3>Question {index + 1}:</h3> {/* Show the question number. */}
              <p className='flashcard-question'>{flashcard.question}</p> {/* Display the flashcard question. */}
              <div className="result-options"> {/* Container for displaying answer options. */}
                {generatedOptions[index].map((option, optionIndex) => ( // Loop through options for the question.
                  <button
                    key={optionIndex} // Unique key for each option button.
                    className={`result-option ${
                      option === flashcard.answer // Add "correct" class for the right answer.
                        ? 'correct'
                        : answers[index] === option // Add "incorrect" class if the user's answer is wrong.
                        ? 'incorrect'
                        : '' // No additional class for unselected options.
                    }`}
                    disabled // Disable buttons to prevent interaction in result view.
                  >
                    {option} {/* Display the option text. */}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate(`/flashcardSet/${setId}`)}> {/* Button to navigate back to the flashcard set. */}
          Back to Set
        </button>
      </div>
    );

  return (
    <div className="flashcard-test-page"> {/* Main container for test mode UI. */}
      <h2>Test Mode</h2> {/* Header to indicate test mode is active. */}
      <div className="questions-list"> {/* Container for listing all questions in the test. */}
        {flashcards.map((flashcard, index) => ( // Loop through each flashcard to render its question.
          <div key={index} className="question-section"> {/* Container for each question and its options. */}
            <h3>Question {index + 1}:</h3> {/* Display the question number. */}
            <p className='flashcard-question'>{flashcard.question}</p> {/* Display the question text. */}
            <div className="options-section"> {/* Container for displaying answer options. */}
              {generatedOptions[index].map((option, optionIndex) => ( // Loop through options for the question.
                <button
                  key={optionIndex} // Unique key for each option button.
                  className={`option ${
                    answers[index] === option ? 'selected' : '' // Highlight the selected option.
                  }`}
                  onClick={() => handleAnswerSelect(index, option)} // Handle user's option selection.
                >
                  {option} {/* Display the option text. */}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        className="submit-button" // Class for styling the submit button.
        onClick={handleSubmitTest} // Handle test submission when clicked.
        disabled={answers.includes(null)} // Disable the button if there are unanswered questions.
      >
        Submit Test
      </button>
    </div>
  );
};

export default FlashcardTestPage; // Export the component for use in other parts of the application.
