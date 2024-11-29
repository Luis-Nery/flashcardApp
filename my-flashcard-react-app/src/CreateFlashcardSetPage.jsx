import React, { useState, useEffect } from 'react'; // Import necessary React hooks
import axios from 'axios'; // Import Axios for making HTTP requests
import { auth } from './firebaseConfiguration'; // Import Firebase authentication
import './CreateFlashcardSetPage.css'; // Import CSS for styling
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const CreateFlashcardSetPage = ({ userId }) => { // Component takes in userId as a prop
  const navigate = useNavigate(); // Hook for programmatically navigating between routes
  const [title, setTitle] = useState(''); // State for the flashcard set title
  const [flashcards, setFlashcards] = useState([{ question: '', answer: '' }]); // State to store flashcards
  const [error, setError] = useState(''); // State for error messages
  const [successMessage, setSuccessMessage] = useState(''); // State for success messages

  const handleTitleChange = (e) => setTitle(e.target.value); // Updates the title state when user types in the title input

  const handleFlashcardChange = (index, field, value) => {
    const newFlashcards = [...flashcards]; // Create a shallow copy of the flashcards array
    newFlashcards[index][field] = value; // Update the specific field (question or answer) of the flashcard at the given index
    setFlashcards(newFlashcards); // Set the updated flashcards array
  };

  const addFlashcard = () => {
    setFlashcards([...flashcards, { question: '', answer: '' }]); // Append a new blank flashcard to the array
  };

  const removeFlashcard = (index) => {
    const newFlashcards = flashcards.filter((_, i) => i !== index); // Remove the flashcard at the specified index
    setFlashcards(newFlashcards); // Update the flashcards array
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)

    try {
      const user = auth.currentUser; // Get the currently authenticated user
      if (user) {
        const token = await user.getIdToken(); // Retrieve the user's authentication token

        // API call to create a new flashcard set
        const response = await axios.post(
          `http://localhost:8080/api/users/${userId}/flashcardSets/create`, // API endpoint with userId included
          {
            title, // Flashcard set title
            flashcards, // Array of flashcards
          },
          { headers: { Authorization: `Bearer ${token}` } } // Pass authentication token in the headers
        );

        setTitle(''); // Reset the title input field
        setFlashcards([{ question: '', answer: '' }]); // Reset the flashcards array to an initial blank state
        setSuccessMessage('Flashcard set created successfully!'); // Display a success message

        // Redirect to the flashcard set list page after a short delay
        setTimeout(() => {
          navigate('/flashcardSetList'); // Navigate to the flashcard set list route
        }, 1500); // Wait for 1.5 seconds before redirecting
      } else {
        setError('User is not authenticated'); // Set error if no authenticated user is found
      }
    } catch (err) {
      console.error(err); // Log the error to the console
      setError('Failed to create flashcard set'); // Set an error message for the user
    }
  };

  const handleTextareaResize = (e) => {
    const textarea = e.target; // Reference the event target (textarea)
    textarea.style.height = 'auto'; // Reset height to auto to shrink before resizing
    textarea.style.height = `${textarea.scrollHeight}px`; // Dynamically adjust height based on content
  };

  useEffect(() => {
    const textareas = document.querySelectorAll('textarea'); // Select all textarea elements
    textareas.forEach((textarea) => {
      textarea.style.height = 'auto'; // Reset height to auto
      textarea.style.height = `${textarea.scrollHeight}px`; // Dynamically adjust height for all textareas
    });
  }, [flashcards]); // Trigger effect whenever the flashcards array changes

  return (
    <div className="create-flashcard-set-page">
      <h2>Create Flashcard Set</h2>
      <form onSubmit={handleSubmit}> {/* Form element with an onSubmit handler */}
        
        <label>
          Set Title: {/* Label for the flashcard set title */}
          <input
            type="text"
            value={title} // Controlled input linked to the title state
            onChange={handleTitleChange} // Updates title state on input change
            placeholder="Enter flashcard set title" // Placeholder text for guidance
            required // Makes this field mandatory
          />
        </label>
  
        <h3>Flashcards</h3> {/* Section title for flashcards */}
        {flashcards.map((flashcard, index) => ( // Maps through the flashcards array
          <div key={index} className="flashcard-input"> {/* Unique key ensures React can track elements efficiently */}
            
            <div className="flashcard-header"> {/* Header for flashcard with a remove button */}
              <button
                type="button" // Non-submit button to prevent form submission
                className="remove-flashcard-button" // Styled button for removing a flashcard
                onClick={() => removeFlashcard(index)} // Removes the flashcard at the given index
              >
                ✖ {/* Icon for the remove button */}
              </button>
            </div>
  
            <div className="question"> {/* Container for the question input */}
              <label>Question:</label> {/* Label for the question field */}
              <textarea
                value={flashcard.question} // Controlled textarea linked to the flashcard's question field
                onChange={(e) => handleFlashcardChange(index, 'question', e.target.value)} // Updates question value for the specific flashcard
                placeholder="Enter question" // Guidance text
                required // Makes this field mandatory
                onInput={handleTextareaResize} // Dynamically adjusts the height of the textarea
              />
            </div>
  
            <div className="answer"> {/* Container for the answer input */}
              <label>Answer:</label> {/* Label for the answer field */}
              <textarea
                value={flashcard.answer} // Controlled textarea linked to the flashcard's answer field
                onChange={(e) => handleFlashcardChange(index, 'answer', e.target.value)} // Updates answer value for the specific flashcard
                placeholder="Enter answer" // Guidance text
                required // Makes this field mandatory
                onInput={handleTextareaResize} // Dynamically adjusts the height of the textarea
              />
            </div>
          </div>
        ))}
  
        <button 
          type="button" 
          onClick={addFlashcard} // Adds a new flashcard to the array
          className="add-flashcard-button"
        >
          + Add Flashcard {/* Text indicating the button's function */}
        </button>
        
        <button 
          type="submit" 
          className="submit-button"
        >
          Create Set {/* Submit button for creating the flashcard set */}
        </button>
      </form>
  
      {error && <p className="error-message">{error}</p>} {/* Displays error message if error state is set */}
      {successMessage && <p className="success-message">{successMessage}</p>} {/* Displays success message if successMessage state is set */}
    </div>
  );
};
  export default CreateFlashcardSetPage; // Exports the component for use in other parts of the app
  