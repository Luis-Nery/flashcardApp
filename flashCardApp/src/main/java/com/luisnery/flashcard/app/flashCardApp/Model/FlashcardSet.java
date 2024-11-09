package com.luisnery.flashcard.app.flashCardApp.Model;

import java.util.List;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class FlashcardSet {
	@Id
	private String id;
	private String title;
	private List<Flashcard> flashcards;

	public FlashcardSet() {
		if(this.id==null) {
			this.id=UUID.randomUUID().toString();	
		}
	}

	public FlashcardSet(String title, List<Flashcard> flashcards) {
		if(this.id==null) {
			this.id=UUID.randomUUID().toString();	
		}
		this.title = title;
		this.flashcards = flashcards;
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public List<Flashcard> getFlashcards() {
		return flashcards;
	}

	public void setFlashcards(List<Flashcard> flashcards) {
		this.flashcards = flashcards;
	}
}
