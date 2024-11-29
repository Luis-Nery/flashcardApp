package com.luisnery.flashcard.app.flashCardApp.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.UUID;

/**
 * Represents a Flashcard entity stored in a MongoDB collection.
 */
@Document
public class Flashcard {
    @Id
    private String id;  // Unique identifier for the flashcard
    private String question;  // The question text of the flashcard
    private String answer;    // The answer text of the flashcard

    /**
     * Default constructor.
     * Automatically generates a unique ID if not already set.
     */
    public Flashcard() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString(); // Generate a unique ID
        }
    }

    /**
     * Parameterized constructor to create a flashcard with a specific question and answer.
     * Automatically generates a unique ID if not already set.
     *
     * @param question the question text of the flashcard.
     * @param answer   the answer text of the flashcard.
     */
    public Flashcard(String question, String answer) {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString(); // Generate a unique ID
        }
        this.question = question;
        this.answer = answer;
    }

    /**
     * Gets the unique ID of the flashcard.
     *
     * @return the flashcard's ID.
     */
    public String getId() {
        return this.id;
    }

    /**
     * Sets the unique ID of the flashcard.
     *
     * @param id the flashcard's ID.
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Gets the question text of the flashcard.
     *
     * @return the question text.
     */
    public String getQuestion() {
        return question;
    }

    /**
     * Sets the question text of the flashcard.
     *
     * @param question the question text.
     */
    public void setQuestion(String question) {
        this.question = question;
    }

    /**
     * Gets the answer text of the flashcard.
     *
     * @return the answer text.
     */
    public String getAnswer() {
        return answer;
    }

    /**
     * Sets the answer text of the flashcard.
     *
     * @param answer the answer text.
     */
    public void setAnswer(String answer) {
        this.answer = answer;
    }
}
