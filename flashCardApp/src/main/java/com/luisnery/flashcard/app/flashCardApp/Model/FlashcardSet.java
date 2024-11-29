package com.luisnery.flashcard.app.flashCardApp.Model;

import java.util.List;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a Flashcard Set entity stored in a MongoDB collection.
 */
@Document
public class FlashcardSet {
    @Id
    private String id; // Unique identifier for the flashcard set
    private String title; // Title of the flashcard set
    private List<Flashcard> flashcards; // List of flashcards in the set

    /**
     * Default constructor.
     * Automatically generates a unique ID if not already set.
     */
    public FlashcardSet() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString(); // Generate a unique ID
        }
    }

    /**
     * Parameterized constructor to create a flashcard set with a specific title and list of flashcards.
     * Automatically generates a unique ID if not already set.
     *
     * @param title      the title of the flashcard set.
     * @param flashcards the list of flashcards in the set.
     */
    public FlashcardSet(String title, List<Flashcard> flashcards) {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString(); // Generate a unique ID
        }
        this.title = title;
        this.flashcards = flashcards;
    }

    /**
     * Gets the unique ID of the flashcard set.
     *
     * @return the flashcard set's ID.
     */
    public String getId() {
        return this.id;
    }

    /**
     * Sets the unique ID of the flashcard set.
     *
     * @param id the flashcard set's ID.
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Gets the title of the flashcard set.
     *
     * @return the title of the flashcard set.
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the title of the flashcard set.
     *
     * @param title the title of the flashcard set.
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Gets the list of flashcards in the flashcard set.
     *
     * @return the list of flashcards.
     */
    public List<Flashcard> getFlashcards() {
        return flashcards;
    }

    /**
     * Sets the list of flashcards in the flashcard set.
     *
     * @param flashcards the list of flashcards.
     */
    public void setFlashcards(List<Flashcard> flashcards) {
        this.flashcards = flashcards;
    }
}
