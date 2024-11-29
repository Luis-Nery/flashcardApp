import { StrictMode } from 'react';  
// Imports 'StrictMode' from React to highlight potential problems in the application during development.

import { createRoot } from 'react-dom/client';  
// Imports 'createRoot' from 'react-dom/client' to initialize the React app using the new root API for React 18+.

import './index.css';  
// Imports the global CSS file for styling the entire application.

import App from './App.jsx';  
// Imports the main 'App' component that serves as the root component of the application.

createRoot(document.getElementById('root')).render(  
// Initializes a React root on the HTML element with the id 'root' and renders the application.
  <StrictMode>  
  {/* Wraps the application in 'StrictMode' to enable additional checks and warnings in development mode. */}
    <App />  
    {/* Renders the 'App' component. */}
  </StrictMode>,
);  
// The entire app is rendered within the 'StrictMode' to ensure code adheres to React's best practices.
