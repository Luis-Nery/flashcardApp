package com.luisnery.flashcard.app.flashCardApp.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class User {
    @Id
    private String id;  // Firebase UID
    private String email;
    private String displayName; // Optional, for user-friendly name
    private List<FlashcardSet> flashcardSets;

    // Constructors, getters, and setters
    
    public User() {
        this.flashcardSets = new ArrayList<>(); // Initialize as empty
    }
    
    public User(String id, String email, String displayName) {
        this.id = id;
        this.email = email;
        this.displayName = displayName;
        this.flashcardSets = new ArrayList<>(); // Start with an empty list of flashcard sets
    }

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getDisplayName() {
		return displayName;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public List<FlashcardSet> getFlashcardSets() {
		return flashcardSets;
	}

	public void setFlashcardSets(List<FlashcardSet> flashcardSets) {
		this.flashcardSets = flashcardSets;
	}
	 public void addFlashcardSet(FlashcardSet flashcardSet) {
	        this.flashcardSets.add(flashcardSet);
	    }

}
