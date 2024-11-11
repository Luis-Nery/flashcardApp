package com.luisnery.flashcard.app.flashCardApp.Firebase;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import java.io.FileInputStream;
import java.io.IOException;

public class FirebaseInitialization {

	public static void initialize() throws IOException {
		// Path to your Firebase Admin SDK private key JSON file
		FileInputStream serviceAccount = new FileInputStream("src/main/resources/serviceAccountKey.json"); // Adjust
																											// this path
																											// if
																											// necessary

		// Use GoogleCredentials instead of FirebaseCredentials
		GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);

		FirebaseOptions options = new FirebaseOptions.Builder().setCredentials(credentials).build();

		FirebaseApp.initializeApp(options); // Initialize Firebase
	}
}
