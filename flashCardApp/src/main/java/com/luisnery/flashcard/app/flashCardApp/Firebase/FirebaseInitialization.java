package com.luisnery.flashcard.app.flashCardApp.Firebase;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import java.io.FileInputStream;
import java.io.IOException;

/**
 * Handles the initialization of Firebase services for the application.
 * Uses Firebase Admin SDK with credentials provided in a service account JSON file.
 */
public class FirebaseInitialization {

    /**
     * Initializes Firebase using the service account key.
     *
     * @throws IOException if there is an issue reading the service account key file.
     */
    public static void initialize() throws IOException {
        // Path to your Firebase Admin SDK private key JSON file
        FileInputStream serviceAccount = new FileInputStream("src/main/resources/serviceAccountKey.json"); 
        // Adjust the path if necessary to point to your service account key file

        // Load credentials from the service account key file
        GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);

        // Build Firebase options using the loaded credentials
        FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(credentials)
                .build();

        // Initialize the Firebase App with the configured options
        FirebaseApp.initializeApp(options);
    }
}
