# Flashcard App

A full-stack flashcard app designed to help users create, manage, and study flashcards efficiently. The app allows users to organize flashcards into sets, authenticate securely, and access their personalized flashcards anytime. Inspired by Quizlet, it provides a user-friendly interface for seamless learning.

---

## Features

- **User Authentication**: Secure login/signup using Firebase authentication (Google Sign-In and email/password).  
- **Personalized Flashcards**: Each user has their own sets of flashcards stored in MongoDB.  
- **Set Management**: Create, view, and manage multiple sets of flashcards.  
- **Responsive Design**: A React-based front end ensures compatibility across devices.  

---

## Tech Stack

### Frontend
- **React** (with Vite for development)  
- **CSS** for styling  

### Backend
- **Java Spring Boot**  
- **MongoDB** for database management  

### Authentication
- **Firebase Authentication**  

---

## Prerequisites

1. **Node.js** (for running the React frontend)  
2. **Java 17 or above** (for the Spring Boot backend)  
3. **MongoDB** (local or cloud instance)  
4. **Firebase Project** (set up authentication)  

---

## Setup Instructions

### Frontend

Clone the repository:  
   ```bash
   git clone https://github.com/Luis-Nery/flashcardApp.git
   cd flashcardApp
the backend will also be cloned upon cloning the repo:
run the backend application after configuring the MongoDB URI if it's different:
   spring.data.mongodb.uri=mongodb://localhost:27017/flashcard-app
run npm run dev
and acess the application trough [hptt:](http://localhost:5173/)

### Backend

Run the Spring Boot Application to succesfully gather information from your MongoDB database.

