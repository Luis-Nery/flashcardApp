package com.luisnery.flashcard.app.flashCardApp.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.UUID;

@Document
public class Flashcard {
	@Id
	private String id;
	private String question;
	private String answer;
	
	public Flashcard() {
		if(this.id==null) {
			this.id=UUID.randomUUID().toString();	
		}
	}

	public Flashcard(String question, String answer) {
		if(this.id==null) {
			this.id=UUID.randomUUID().toString();	
		}
		this.question = question;
		this.answer = answer;
	}
	public String getId() {
		return this.id;
	}
	public void setId(String id) {
		this.id=id;
	}

	public String getQuestion() {
		return question;
	}

	public void setQuestion(String question) {
		this.question = question;
	}

	public String getAnswer() {
		return answer;
	}

	public void setAnswer(String answer) {
		this.answer = answer;
	}
	

}
