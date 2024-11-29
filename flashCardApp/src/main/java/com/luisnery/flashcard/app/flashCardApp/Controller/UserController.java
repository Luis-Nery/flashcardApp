package com.luisnery.flashcard.app.flashCardApp.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.luisnery.flashcard.app.flashCardApp.Model.Flashcard;
import com.luisnery.flashcard.app.flashCardApp.Model.FlashcardSet;
import com.luisnery.flashcard.app.flashCardApp.Model.User;
import com.luisnery.flashcard.app.flashCardApp.Repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.FirebaseAuthException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Creates a new user or retrieves an existing one based on the Firebase UID.
     * Validates the Firebase token provided in the Authorization header to ensure
     * that the user is authenticated.
     *
     * @param user  The user data to create or update.
     * @param token The Firebase ID token from the Authorization header.
     * @return A ResponseEntity containing the created/retrieved user or an error
     *         status.
     */
    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody User user, @RequestHeader("Authorization") String token) {
        try {
            // Extract the Firebase ID token from the Authorization header
            String idToken = token.replace("Bearer ", "");

            // Verify the ID token using Firebase Admin SDK
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid(); // Extract UID from Firebase token

            // Check if the user already exists in the database
            Optional<User> existingUser = userRepository.findById(uid);
            if (existingUser.isPresent()) {
                return ResponseEntity.ok(existingUser.get()); // Return the existing user
            } else {
                // Create a new user with the Firebase UID
                user.setId(uid);
                User savedUser = userRepository.save(user);
                return ResponseEntity.ok(savedUser);
            }

        } catch (FirebaseAuthException e) {
            // If the token is invalid or expired, return a 401 Unauthorized response
            return ResponseEntity.status(401).body(null);
        } catch (Exception e) {
            // Handle any other unexpected errors
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Adds a new flashcard set to a user. Validates the Firebase token provided in
     * the Authorization header.
     *
     * @param firebaseId   The Firebase ID token from the Authorization header.
     * @param flashcardSet The flashcard set data to add.
     * @return A ResponseEntity containing the created flashcard set or an error
     *         status.
     */
    @PostMapping("/{userId}/flashcardSets/create")
    public ResponseEntity<FlashcardSet> createFlashcardSet(@RequestHeader("Authorization") String firebaseId,
            @RequestBody FlashcardSet flashcardSet) {
        try {
            // Validate Firebase token
            String idToken = firebaseId.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            // Check if the user exists
            Optional<User> user = userRepository.findById(uid);
            if (!user.isPresent()) {
                return ResponseEntity.notFound().build(); // User not found
            }

            // Create and add a new flashcard set
            FlashcardSet newSet = new FlashcardSet();
            newSet.setTitle(flashcardSet.getTitle());
            newSet.setFlashcards(flashcardSet.getFlashcards());

            user.get().getFlashcardSets().add(newSet);
            userRepository.save(user.get());

            return ResponseEntity.ok(newSet); // Return the created flashcard set
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Adds a new flashcard to an existing flashcard set of a user. Validates the
     * Firebase token and checks if the flashcard set exists before adding.
     *
     * @param firebaseId  The Firebase ID token from the Authorization header.
     * @param setId       The ID of the flashcard set to update.
     * @param newFlashcard The flashcard data to add.
     * @return A ResponseEntity containing the added flashcard or an error status.
     */
    @PostMapping("/{userId}/flashcardSets/{setId}/addFlashcard")
    public ResponseEntity<Flashcard> addFlashcard(@RequestHeader("Authorization") String firebaseId,
            @PathVariable("setId") String setId, @RequestBody Flashcard newFlashcard) {
        try {
            // Validate Firebase token
            String idToken = firebaseId.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            // Retrieve the user from the database
            Optional<User> userOptional = userRepository.findById(uid);
            if (!userOptional.isPresent()) {
                return ResponseEntity.notFound().build(); // User not found
            }

            User user = userOptional.get();

            // Retrieve the flashcard set from the user's data
            Optional<FlashcardSet> flashcardSetOptional = user.getFlashcardSets().stream()
                    .filter(set -> set.getId().equals(setId)).findFirst();

            if (!flashcardSetOptional.isPresent()) {
                return ResponseEntity.notFound().build(); // Flashcard set not found
            }

            FlashcardSet flashcardSet = flashcardSetOptional.get();

            // Add the new flashcard to the set
            flashcardSet.getFlashcards().add(newFlashcard);

            // Save the updated user data
            userRepository.save(user);

            return ResponseEntity.ok(newFlashcard); // Return the newly added flashcard
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null); // Internal Server Error
        }
    }


 // Get all users
    /**
     * Retrieves a list of all users in the database.
     *
     * @return A ResponseEntity containing a list of all users or an HTTP error status.
     */
    @GetMapping("/getAll")
    public ResponseEntity<List<User>> getAllMessages() {
        // Fetch all users from the repository
        List<User> messages = userRepository.findAll();
        return ResponseEntity.ok(messages); // Return HTTP 200 OK with the list of users
    }

    // Get a user by ID
    /**
     * Retrieves a user by their unique ID.
     *
     * @param id The ID of the user to retrieve.
     * @return A ResponseEntity containing the user if found or an HTTP 404 Not Found status.
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        // Find user by ID
        Optional<User> user = userRepository.findById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Check if a user exists
    /**
     * Verifies the existence of a user in the database by validating their Firebase ID token.
     *
     * @param token The Firebase ID token provided in the Authorization header.
     * @return A ResponseEntity containing the user details if found, or an appropriate error status.
     */
    @GetMapping("/checkIfUserExists")
    public ResponseEntity<User> checkIfUserExists(@RequestHeader("Authorization") String token) {
        try {
            // Extract and verify the Firebase ID token
            String idToken = token.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid(); // Extract UID from the token

            // Check if the user exists in the database
            Optional<User> userOptional = userRepository.findById(uid);

            if (userOptional.isPresent()) {
                return ResponseEntity.ok(userOptional.get()); // Return user details if found
            } else {
                return ResponseEntity.notFound().build(); // Return 404 if the user is not found
            }
        } catch (FirebaseAuthException e) {
            // Handle invalid or expired Firebase token
            return ResponseEntity.status(401).body(null); // Return 401 Unauthorized
        } catch (Exception e) {
            // Handle any other errors
            e.printStackTrace();
            return ResponseEntity.status(500).body(null); // Return 500 Internal Server Error
        }
    }

    // Get all sets of a user
    /**
     * Retrieves all flashcard sets associated with a user. Validates the user's Firebase token.
     *
     * @param firebaseId The Firebase ID token provided in the Authorization header.
     * @return A ResponseEntity containing a list of flashcard sets or an appropriate error status.
     */
    @GetMapping("/{userId}/flashcardSets")
    public ResponseEntity<List<FlashcardSet>> getAllFlashcardSetsForUser(@RequestHeader("Authorization") String firebaseId) {
        try {
            // Validate Firebase token
            String idToken = firebaseId.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid(); // Extract UID from the token

            // Find the user by UID
            Optional<User> user = userRepository.findById(uid);

            if (user.isPresent()) {
                // Retrieve all flashcard sets associated with the user
                List<FlashcardSet> flashcardSets = user.get().getFlashcardSets();
                return ResponseEntity.ok(flashcardSets); // Return the list of flashcard sets
            } else {
                return ResponseEntity.notFound().build(); // Return 404 if the user is not found
            }
        } catch (FirebaseAuthException e) {
            // Handle invalid or expired Firebase token
            return ResponseEntity.status(401).body(null); // Return 401 Unauthorized
        } catch (Exception e) {
            // Handle any other errors
            return ResponseEntity.status(500).body(null); // Return 500 Internal Server Error
        }
    }

    // Get a single FlashcardSet by ID of a User
    /**
     * Retrieves a specific flashcard set by its ID for a given user.
     * Validates the user's Firebase token and ensures the set belongs to the user.
     *
     * @param firebaseId The Firebase ID token provided in the Authorization header.
     * @param setId      The ID of the flashcard set to retrieve.
     * @return A ResponseEntity containing the flashcard set or an appropriate error status.
     */
    @GetMapping("/{userId}/flashcardSets/{setId}")
    public ResponseEntity<FlashcardSet> getFlashcardSetById(@RequestHeader("Authorization") String firebaseId,
            @PathVariable("setId") String setId) {
        try {
            // Validate Firebase token
            String idToken = firebaseId.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid(); // Extract UID from the token

            // Find the user by UID
            Optional<User> user = userRepository.findById(uid);

            if (user.isPresent()) {
                // Find the specific flashcard set by its ID
                FlashcardSet set = user.get().getFlashcardSets().stream()
                        .filter(s -> s.getId().equals(setId)).findFirst().orElse(null);

                if (set != null) {
                    return ResponseEntity.ok(set); // Return the flashcard set if found
                } else {
                    return ResponseEntity.notFound().build(); // Return 404 if the set is not found
                }
            } else {
                return ResponseEntity.notFound().build(); // Return 404 if the user is not found
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build(); // Return 404 for any unexpected error
        }
    }


 // Get all flashcards of a set of a single user
    /**
     * Retrieves all flashcards within a specific flashcard set for a given user.
     * Validates the user's Firebase token and ensures the set belongs to the user.
     *
     * @param setId      The ID of the flashcard set to retrieve flashcards from.
     * @param firebaseId The Firebase ID token provided in the Authorization header.
     * @return A ResponseEntity containing the list of flashcards or an appropriate error status.
     */
    @GetMapping("/{userId}/flashcardSets/{setId}/flashcards")
    public ResponseEntity<List<Flashcard>> getAllFlashcardsOfASet(@PathVariable("setId") String setId,
            @RequestHeader("Authorization") String firebaseId) {
        try {
            // Extract and validate the Firebase ID token
            String idToken = firebaseId.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid(); // Extract UID from the token

            // Find the user by their UID
            Optional<User> user = userRepository.findById(uid);

            if (user.isPresent()) {
                // Retrieve the list of flashcard sets
                List<FlashcardSet> flashcardSets = user.get().getFlashcardSets();

                if (flashcardSets != null && !flashcardSets.isEmpty()) {
                    // Find the flashcard set by its ID
                    FlashcardSet flashcardSet = flashcardSets.stream()
                            .filter(set -> set.getId().equals(setId))
                            .findFirst().orElse(null);

                    if (flashcardSet != null) {
                        // Return all flashcards within the set
                        return ResponseEntity.ok(flashcardSet.getFlashcards());
                    } else {
                        return ResponseEntity.notFound().build(); // Flashcard set not found
                    }
                } else {
                    return ResponseEntity.notFound().build(); // No flashcard sets found for the user
                }
            } else {
                return ResponseEntity.notFound().build(); // User not found
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null); // Internal Server Error
        }
    }

    // Update the title of a specific flashcard set
    /**
     * Updates the title of a specific flashcard set for a given user.
     * Validates the user's Firebase token and ensures the set belongs to the user.
     *
     * @param firebaseId        The Firebase ID token provided in the Authorization header.
     * @param setId             The ID of the flashcard set to update.
     * @param titleUpdateRequest A map containing the new title for the flashcard set.
     * @return A ResponseEntity containing the updated flashcard set or an appropriate error status.
     */
    @PutMapping("/{userId}/flashcardSets/{setId}/updateTitle")
    public ResponseEntity<FlashcardSet> updateFlashcardSetTitle(@RequestHeader("Authorization") String firebaseId,
            @PathVariable("setId") String setId, @RequestBody Map<String, String> titleUpdateRequest) {
        try {
            // Extract and validate the Firebase ID token
            String idToken = firebaseId.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid(); // Extract UID from the token

            // Find the user by their UID
            Optional<User> user = userRepository.findById(uid);

            if (user.isPresent()) {
                // Find the flashcard set by its ID
                FlashcardSet set = user.get().getFlashcardSets().stream()
                        .filter(s -> s.getId().equals(setId))
                        .findFirst().orElse(null);

                if (set != null && titleUpdateRequest.containsKey("title")) {
                    // Update the title of the flashcard set
                    set.setTitle(titleUpdateRequest.get("title"));
                    userRepository.save(user.get()); // Save the updated user

                    return ResponseEntity.ok(set); // Return the updated flashcard set
                } else {
                    return ResponseEntity.notFound().build(); // Flashcard set or title not found
                }
            } else {
                return ResponseEntity.notFound().build(); // User not found
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null); // Internal Server Error
        }
    }

    // Add multiple flashcards to a flashcard set of a single user
    /**
     * Adds multiple flashcards to a specific flashcard set for a given user.
     * Validates the user's Firebase token and ensures the set belongs to the user.
     *
     * @param firebaseId The Firebase ID token provided in the Authorization header.
     * @param setId      The ID of the flashcard set to add flashcards to.
     * @param flashcards A list of flashcards to add to the set.
     * @return A ResponseEntity containing the updated flashcard set or an appropriate error status.
     */
    @PutMapping("/{userId}/flashcardSets/{setId}/addFlashcards")
    public ResponseEntity<FlashcardSet> addFlashcardsToSet(@RequestHeader("Authorization") String firebaseId,
            @PathVariable("setId") String setId, @RequestBody List<Flashcard> flashcards) {
        try {
            // Extract and validate the Firebase ID token
            String idToken = firebaseId.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid(); // Extract UID from the token

            // Find the user by their UID
            Optional<User> user = userRepository.findById(uid);
            if (!user.isPresent()) {
                return ResponseEntity.notFound().build(); // User not found
            }

            // Find the flashcard set by its ID
            FlashcardSet set = user.get().getFlashcardSets().stream()
                    .filter(s -> s.getId().equals(setId))
                    .findFirst().orElse(null);

            if (set == null) {
                return ResponseEntity.notFound().build(); // Flashcard set not found
            }

            // Add all new flashcards to the set
            set.getFlashcards().addAll(flashcards);

            // Save the updated user with the modified flashcard set
            userRepository.save(user.get());

            return ResponseEntity.ok(set); // Return the updated flashcard set
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null); // Internal Server Error
        }
    }


 // Update the question and answer of a created flashcard
    /**
     * Updates the question and answer of a specific flashcard within a flashcard set.
     * Validates the user's Firebase token and ensures the flashcard belongs to the user.
     *
     * @param firebaseId      The Firebase ID token provided in the Authorization header.
     * @param setId           The ID of the flashcard set containing the flashcard.
     * @param flashcardId     The ID of the flashcard to update.
     * @param updatedFlashcard The updated flashcard object containing the new question and answer.
     * @return A ResponseEntity containing the updated flashcard or an appropriate error status.
     */
    @PutMapping("/{userId}/flashcardSets/{setId}/flashcards/{flashcardId}/updateQuestionAndAnswer")
    public ResponseEntity<Flashcard> updateFlashcard(@RequestHeader("Authorization") String firebaseId,
            @PathVariable("setId") String setId, @PathVariable("flashcardId") String flashcardId,
            @RequestBody Flashcard updatedFlashcard) {
        try {
            // Validate Firebase token
            String idToken = firebaseId.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            // Find the user by their UID
            Optional<User> userOptional = userRepository.findById(uid);
            if (!userOptional.isPresent()) {
                return ResponseEntity.notFound().build(); // User not found
            }

            User user = userOptional.get();
            Optional<FlashcardSet> flashcardSetOptional = user.getFlashcardSets().stream()
                    .filter(set -> set.getId().equals(setId)).findFirst();

            if (!flashcardSetOptional.isPresent()) {
                return ResponseEntity.notFound().build(); // Flashcard set not found
            }

            FlashcardSet flashcardSet = flashcardSetOptional.get();

            // Find the flashcard within the set
            Optional<Flashcard> flashcardOptional = flashcardSet.getFlashcards().stream()
                    .filter(flashcard -> flashcard.getId().equals(flashcardId)).findFirst();

            if (!flashcardOptional.isPresent()) {
                return ResponseEntity.notFound().build(); // Flashcard not found
            }

            Flashcard flashcard = flashcardOptional.get();

            // Update the flashcard details
            flashcard.setQuestion(updatedFlashcard.getQuestion());
            flashcard.setAnswer(updatedFlashcard.getAnswer());

            // Save the updated user
            userRepository.save(user);

            return ResponseEntity.ok(flashcard); // Return the updated flashcard
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null); // Internal Server Error
        }
    }

    // Delete a flashcard from a flashcard set
    /**
     * Deletes a specific flashcard from a flashcard set for a given user.
     * Validates the user's Firebase token and ensures the flashcard belongs to the user.
     *
     * @param firebaseId  The Firebase ID token provided in the Authorization header.
     * @param setId       The ID of the flashcard set containing the flashcard.
     * @param flashcardId The ID of the flashcard to delete.
     * @return A ResponseEntity containing the updated flashcard set or an appropriate error status.
     */
    @DeleteMapping("/{userId}/flashcardSets/{setId}/flashcards/{flashcardId}/removeFlashcard")
    public ResponseEntity<FlashcardSet> removeFlashcardFromSet(@RequestHeader("Authorization") String firebaseId,
            @PathVariable("setId") String setId, @PathVariable("flashcardId") String flashcardId) {
        try {
            // Validate Firebase token
            String idToken = firebaseId.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            // Find the user by their UID
            Optional<User> userOptional = userRepository.findById(uid);
            if (!userOptional.isPresent()) {
                return ResponseEntity.notFound().build(); // User not found
            }
            User user = userOptional.get();

            // Find the flashcard set by its ID
            FlashcardSet flashcardSet = user.getFlashcardSets().stream()
                    .filter(set -> set.getId().equals(setId)).findFirst().orElse(null);

            if (flashcardSet == null) {
                return ResponseEntity.notFound().build(); // Flashcard set not found
            }

            // Remove the flashcard by its ID
            boolean removed = flashcardSet.getFlashcards().removeIf(flashcard -> flashcard.getId().equals(flashcardId));

            if (removed) {
                userRepository.save(user); // Save the user after removal
                return ResponseEntity.ok(flashcardSet); // Return the updated flashcard set
            } else {
                return ResponseEntity.notFound().build(); // Flashcard not found
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null); // Internal Server Error
        }
    }

    // Remove a flashcard set from a user by its ID
    /**
     * Deletes a flashcard set for a user.
     * Validates the user's Firebase token and ensures the set belongs to the user.
     *
     * @param firebaseId The Firebase ID token provided in the Authorization header.
     * @param setId      The ID of the flashcard set to delete.
     * @return A ResponseEntity with no content upon successful deletion or an appropriate error status.
     */
    @DeleteMapping("/{userId}/flashcardSets/{setId}/removeFlashcardSet")
    public ResponseEntity<Void> deleteFlashcardSet(@RequestHeader("Authorization") String firebaseId,
            @PathVariable String userId, @PathVariable String setId) {
        try {
            // Validate Firebase token
            String idToken = firebaseId.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();

            // Find the user by their UID
            Optional<User> userOptional = userRepository.findById(uid);
            if (!userOptional.isPresent()) {
                return ResponseEntity.notFound().build(); // User not found
            }

            User user = userOptional.get();
            boolean removed = user.getFlashcardSets().removeIf(set -> set.getId().equals(setId));

            if (removed) {
                userRepository.save(user); // Save the updated user
                return ResponseEntity.noContent().build(); // Successfully deleted
            } else {
                return ResponseEntity.notFound().build(); // Flashcard set not found
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build(); // Internal Server Error
        }
    }

    // Delete a user by ID
    /**
     * Deletes a user from the database by their ID.
     *
     * @param id The ID of the user to delete.
     * @return A ResponseEntity containing the deleted user or an appropriate error status.
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<User> deleteUser(@PathVariable String id) {
        Optional<User> user = userRepository.findById(id);

        if (user.isPresent()) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(user.get()); // Return the deleted user
        } else {
            return ResponseEntity.notFound().build(); // User not found
        }
    }

}
