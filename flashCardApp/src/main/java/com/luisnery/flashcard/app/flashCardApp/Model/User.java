package com.luisnery.flashcard.app.flashCardApp.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a User entity stored in a MongoDB collection.
 * Each user has a unique identifier, email, display name, and a list of flashcard sets.
 */
@Document(collection = "users")
public class User {
    @Id
    private String id; // Firebase UID (unique identifier)
    private String email; // User's email address
    private String displayName; // User-friendly display name (optional)
    private List<FlashcardSet> flashcardSets; // List of flashcard sets associated with the user

    /**
     * Default constructor.
     * Initializes the flashcardSets list as empty.
     */
    public User() {
        this.flashcardSets = new ArrayList<>(); // Ensure no null pointer exceptions on list operations
    }

    /**
     * Parameterized constructor.
     * Initializes the user with the provided ID, email, and display name.
     * Starts with an empty list of flashcard sets.
     *
     * @param id          the unique identifier (Firebase UID).
     * @param email       the email address of the user.
     * @param displayName the display name of the user.
     */
    public User(String id, String email, String displayName) {
        this.id = id;
        this.email = email;
        this.displayName = displayName;
        this.flashcardSets = new ArrayList<>(); // Start with an empty list of flashcard sets
    }

    /**
     * Gets the user's unique identifier (Firebase UID).
     *
     * @return the user's ID.
     */
    public String getId() {
        return id;
    }

    /**
     * Sets the user's unique identifier (Firebase UID).
     *
     * @param id the user's ID.
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Gets the user's email address.
     *
     * @return the user's email.
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the user's email address.
     *
     * @param email the user's email.
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Gets the user's display name.
     *
     * @return the display name.
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Sets the user's display name.
     *
     * @param displayName the display name.
     */
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    /**
     * Gets the list of flashcard sets associated with the user.
     *
     * @return the list of flashcard sets.
     */
    public List<FlashcardSet> getFlashcardSets() {
        return flashcardSets;
    }

    /**
     * Sets the list of flashcard sets associated with the user.
     *
     * @param flashcardSets the list of flashcard sets.
     */
    public void setFlashcardSets(List<FlashcardSet> flashcardSets) {
        this.flashcardSets = flashcardSets;
    }

    /**
     * Adds a flashcard set to the user's list of flashcard sets.
     *
     * @param flashcardSet the flashcard set to add.
     */
    public void addFlashcardSet(FlashcardSet flashcardSet) {
        this.flashcardSets.add(flashcardSet);
    }
}
