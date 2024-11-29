import React, { useEffect, useState } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { auth } from './firebaseConfiguration'; 
import './FlashcardSetPage.css'; 
import { FaTrashAlt, FaPlus } from 'react-icons/fa'; 

const FlashcardSetPage = () => { 
  // Importing required modules and initializing constants for route navigation, parameters, and Firebase authentication.

  const { setId } = useParams(); // Extracts `setId` parameter from the route.
  const navigate = useNavigate(); // Provides navigation capabilities to redirect users.
  
  const [flashcards, setFlashcards] = useState([]); // Stores the flashcards for the current set.
  const [flashcardSetTitle, setFlashcardSetTitle] = useState(''); // Stores the title of the current flashcard set.
  const [loading, setLoading] = useState(true); // Tracks the loading state for data fetching.
  const [error, setError] = useState(null); // Tracks error messages.
  const [sortAlphabetically, setSortAlphabetically] = useState(false); // Controls sorting of flashcards alphabetically.

  // States for editing title and flashcards
  const [editingTitle, setEditingTitle] = useState(false); // Tracks whether the title is in editing mode.
  const [updatedTitle, setUpdatedTitle] = useState(''); // Temporary state for an updated title during editing.
  const [editingFlashcardId, setEditingFlashcardId] = useState(null); // Tracks the ID of the flashcard currently being edited.
  const [updatedQuestion, setUpdatedQuestion] = useState(''); // Temporary state for an updated question during editing.
  const [updatedAnswer, setUpdatedAnswer] = useState(''); // Temporary state for an updated answer during editing.

  // State for delete confirmation
  const [showDeletePopup, setShowDeletePopup] = useState(false); // Toggles the visibility of the delete confirmation popup.
  const [deleteFlashcardId, setDeleteFlashcardId] = useState(null); // Tracks the ID of the flashcard to be deleted.

  // State for delete status (success or failure)
  const [deleteStatus, setDeleteStatus] = useState(null); // Tracks delete status, ensuring user feedback.

  useEffect(() => { 
    // Executes side effects on component render and updates based on dependencies like `setId` or `sortAlphabetically`.

    const fetchFlashcardsAndTitle = async (userIdToken) => { 
      // Fetches the flashcard set title and its associated flashcards from the server.
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
          // Optional sorting of flashcards by their question field.
          flashcardsData = flashcardsData.sort((a, b) => 
            a.question.localeCompare(b.question) 
          ); 
        } 
        setFlashcards(flashcardsData); 
      } catch (err) { 
        // Handles errors during data fetch, logs error details, and sets error state.
        console.error(err); 
        setError('Failed to fetch flashcards or flashcard set title'); 
      } finally { 
        setLoading(false); // Disables loading indicator after the process completes.
      } 
    }; 

    const authenticateAndFetchData = () => { 
      // Validates user authentication and initiates the data-fetching process.
      auth.onAuthStateChanged(async (user) => { 
        if (user) { 
          const userIdToken = await user.getIdToken(); 
          fetchFlashcardsAndTitle(userIdToken); 
        } else { 
          navigate('/login'); // Redirects unauthenticated users to the login page.
        } 
      }); 
    }; 

    authenticateAndFetchData(); 
  }, [setId, navigate, sortAlphabetically]); 
  // Dependency array ensures effect runs when these values change.

  const deleteFlashcard = async (flashcardId) => { 
    // Handles deletion of a specific flashcard by ID.
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
      setDeleteStatus('success'); // Set delete status to success for user feedback.
    } catch (err) { 
      // Logs error and provides user feedback for failed deletions.
      setError('Failed to delete flashcard'); 
      console.error(err); 
      setDeleteStatus('failed'); // Indicates failure in the UI.
    } finally { 
      // Cleans up the delete popup state after a short delay for user feedback.
      setTimeout(() => { 
        setShowDeletePopup(false); 
        setDeleteFlashcardId(null); 
        setDeleteStatus(null); // Resets the delete status.
      }, 1000); // Waits 1 seconds before resetting UI states.
    } 
  }; 

  const confirmDeleteFlashcard = (flashcardId) => { 
    // Sets the state for confirming the deletion of a flashcard.
    setDeleteFlashcardId(flashcardId); 
    setDeleteStatus(null); // Clears previous statuses for a fresh interaction.
    setShowDeletePopup(true); // Displays the confirmation popup.
  }; 


  const addNewFlashcard = async () => {
    const newFlashcard = {
      question: '',
      answer: '',
    };
  
    try {
      // Ensure the current user is authenticated before proceeding
      const user = auth.currentUser;
      const userIdToken = await user.getIdToken();
  
      // Send a POST request to the server to add a new flashcard
      const response = await axios.post(
        `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/addFlashcard`,
        newFlashcard,
        { headers: { Authorization: `Bearer ${userIdToken}` } }
      );
  
      // Update the flashcards state with the new flashcard returned from the server
      setFlashcards((prevFlashcards) => [...prevFlashcards, response.data]);
  
      // Set the new flashcard's ID to indicate it's being edited
      setEditingFlashcardId(response.data.id);
  
      // Reset the input fields for question and answer
      setUpdatedQuestion('');
      setUpdatedAnswer('');
    } catch (err) {
      // Handle errors when adding a new flashcard
      setError('Failed to add new flashcard');
      console.error(err);
    }
  };
  
  // Toggles the sorting state for flashcards, either alphabetically or by default order
  const toggleSort = () => setSortAlphabetically((prev) => !prev);
  
  // Enables the edit mode for the flashcard set title
  const handleEditTitle = () => {
    setEditingTitle(true);
  };
  
  const handleSaveTitle = async () => {
    try {
      // Authenticate and retrieve the current user's token
      const user = auth.currentUser;
      const userIdToken = await user.getIdToken();
  
      // Send a PUT request to update the title of the flashcard set
      await axios.put(
        `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/updateTitle`,
        { title: updatedTitle },
        { headers: { Authorization: `Bearer ${userIdToken}` } }
      );
  
      // Update the state with the new title and exit editing mode
      setFlashcardSetTitle(updatedTitle);
      setEditingTitle(false);
    } catch (err) {
      // Handle errors during the title update
      setError('Failed to save title changes');
    }
  };
  
  // Cancels the title editing process and reverts changes
  const handleCancelTitleEdit = () => {
    setUpdatedTitle(flashcardSetTitle);
    setEditingTitle(false);
  };
  
  // Initiates editing mode for a specific flashcard
  const handleEditFlashcard = (flashcard) => {
    setEditingFlashcardId(flashcard.id);
    setUpdatedQuestion(flashcard.question);
    setUpdatedAnswer(flashcard.answer);
  };
  
  const handleSaveFlashcardChanges = async (flashcardId) => {
    try {
      // Retrieve the current user's authentication token
      const user = auth.currentUser;
      const userIdToken = await user.getIdToken();
  
      // Send a PUT request to update the specific flashcard's question and answer
      await axios.put(
        `http://localhost:8080/api/users/${userIdToken}/flashcardSets/${setId}/flashcards/${flashcardId}/updateQuestionAndAnswer`,
        { question: updatedQuestion, answer: updatedAnswer },
        { headers: { Authorization: `Bearer ${userIdToken}` } }
      );
  
      // Update the flashcard in the state with the new question and answer
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((flashcard) =>
          flashcard.id === flashcardId
            ? { ...flashcard, question: updatedQuestion, answer: updatedAnswer }
            : flashcard
        )
      );
  
      // Exit editing mode for the flashcard
      setEditingFlashcardId(null);
    } catch (err) {
      // Handle errors while saving flashcard changes
      setError('Failed to save flashcard changes');
    }
  };
  const handleCancelFlashcardEdit = () => {
    // Exits flashcard editing mode by resetting the editing ID
    setEditingFlashcardId(null);
  };
  
  const handleNavigateToTest = () => {
    // Navigates to the test page for the current flashcard set
    navigate(`/test/${setId}`);
  };
  
  // Displays a loading state while data is being fetched
  if (loading) return <div>Loading...</div>;
  
  // Displays an error message if there is an error
  if (error) return <div>{error}</div>;
  
  return (
    <div className="flashcard-set-page">
      <div className="flashcard-set-header">
        {editingTitle ? (
          <div className="flashcard-set-title">
            {/* Input field for editing the flashcard set title */}
            <input
              type="text"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
              className="edit-title-input"
            />
            <div>
              {/* Save and cancel buttons for title editing */}
              <button onClick={handleSaveTitle}>Save</button>
              <button onClick={handleCancelTitleEdit}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flashcard-set-title">
            {/* Displays the current title or 'Untitled Set' if none is set */}
            <span>Current Set: {flashcardSetTitle || 'Untitled Set'}</span>
            <button onClick={handleEditTitle}>Edit Title</button>
          </div>
        )}
      </div>
  
      {/* Toggles the sort order for flashcards */}
      <button className="sort-button" onClick={toggleSort}>
        {sortAlphabetically ? 'Sort by Default' : 'Sort Alphabetically'}
      </button>
  
      {/* Navigates to the test page */}
      <button className="test-button" onClick={handleNavigateToTest}>
        Start Test
      </button>
  
      {/* Renders each flashcard in the set */}
      {flashcards.map((flashcard) => (
        <div className="flashcard" key={flashcard.id}>
          <div className="flashcard-header">
            {/* Displays the question and provides editing and deletion options */}
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
              {/* Input fields for editing the question and answer */}
              <textarea
                value={updatedQuestion}
                onChange={(e) => setUpdatedQuestion(e.target.value)}
              />
              <textarea
                value={updatedAnswer}
                onChange={(e) => setUpdatedAnswer(e.target.value)}
              />
              {/* Save and cancel buttons for editing a flashcard */}
              <button onClick={() => handleSaveFlashcardChanges(flashcard.id)}>Save</button>
              <button onClick={handleCancelFlashcardEdit}>Cancel</button>
            </div>
          ) : (
            // Displays the answer if not in editing mode
            <p>Answer: {flashcard.answer}</p>
          )}
        </div>
      ))}
  
      {/* Button to add a new flashcard */}
      <button className="add-button" onClick={addNewFlashcard}>
        <FaPlus />
      </button>
  
      {/* Popup for confirming flashcard deletion */}
      {showDeletePopup && (
        <div className="delete-popup">
          {deleteStatus === null ? (
            <div className="delete-popup-card">
              <p>Are you sure you want to delete this flashcard?</p>
              {/* Buttons for confirming or canceling deletion */}
              <button onClick={() => deleteFlashcard(deleteFlashcardId)}>Delete</button>
              <button onClick={() => setShowDeletePopup(false)}>Cancel</button>
            </div>
          ) : deleteStatus === 'success' ? (
            <div className="delete-popup-card-success">
              <p>Flashcard deleted successfully!</p>
            </div>
          ) : (
            <div className="delete-popup-card-failed">
              <p>Failed to delete flashcard. Please try again.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
  export default FlashcardSetPage;
  