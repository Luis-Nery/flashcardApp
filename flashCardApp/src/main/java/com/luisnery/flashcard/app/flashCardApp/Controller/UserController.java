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

	// Create a new user
	@PostMapping("/create")
	public ResponseEntity<User> createUser(@RequestBody User user, @RequestHeader("Authorization") String token) {
		try {
			// Extract the Firebase ID token from the Authorization header
			String idToken = token.replace("Bearer ", "");

			// Verify the ID token using Firebase Admin SDK
			FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
			String uid = decodedToken.getUid(); // Get UID from Firebase

			// Now you can use the UID and other data from the request body to create a user
			// For example, if your User object has email and displayName fields
			user.setId(uid); // Set the Firebase UID
			// user.setEmail(decodedToken.getEmail()); // Optionally, you can set the email
			// user.setDisplayName(decodedToken.getName()); // Optionally, set the display
			// name

			// Save the user to the database
			User savedUser = userRepository.save(user);

			return ResponseEntity.ok(savedUser);
		} catch (FirebaseAuthException e) {
			// If the token is invalid or expired, return a 401 Unauthorized response
			return ResponseEntity.status(401).body(null);
		} catch (Exception e) {
			// Handle any other errors
			return ResponseEntity.status(500).body(null);
		}
	}

	// Add a flashcard set to a user
	@PostMapping("/{userId}/flashcardSets/create")
	public ResponseEntity<FlashcardSet> createFlashcardSet(@RequestHeader("Authorization") String firebaseId,
			@RequestBody FlashcardSet flashcardSet) {
		try {
			// Validate Firebase token
			String idToken = firebaseId.replace("Bearer ", "");
			FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
			String uid = decodedToken.getUid();

			// Check if user exists
			Optional<User> user = userRepository.findById(uid);
			if (!user.isPresent()) {
				return ResponseEntity.notFound().build(); // User not found
			}

			// Add the new flashcard set
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

	// Add flashcard to an existing flashcardSet of a user
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

			// Retrieve the flashcard set
			Optional<FlashcardSet> flashcardSetOptional = user.getFlashcardSets().stream()
					.filter(set -> set.getId().equals(setId)).findFirst();

			if (!flashcardSetOptional.isPresent()) {
				return ResponseEntity.notFound().build(); // Flashcard set not found
			}

			FlashcardSet flashcardSet = flashcardSetOptional.get();

			// Add the new flashcard to the set
			flashcardSet.getFlashcards().add(newFlashcard);

			// Save the updated flashcard set
			userRepository.save(user);

			return ResponseEntity.ok(newFlashcard); // Return the newly added flashcard
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body(null); // Internal Server Error
		}
	}

	// Get all users
	@GetMapping("/getAll")
	public ResponseEntity<List<User>> getAllMessages() {
		List<User> messages = userRepository.findAll();
		return ResponseEntity.ok(messages); // HTTP 200 OK with the list of messages
	}

	// Get a user by ID
	@GetMapping("/{id}")
	public ResponseEntity<User> getUserById(@PathVariable String id) {
		Optional<User> user = userRepository.findById(id);
		return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	// Get all sets of a User
	@GetMapping("/{userId}/flashcardSets")
	public ResponseEntity<List<FlashcardSet>> getAllFlashcardSetsForUser(
			@RequestHeader("Authorization") String firebaseId) {
		try {
			// Extract and verify the Firebase ID token from the Authorization header
			String idToken = firebaseId.replace("Bearer ", "");
			FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
			String uid = decodedToken.getUid(); // Get UID from Firebase

			// Find the user by their UID
			Optional<User> user = userRepository.findById(uid);

			if (user.isPresent()) {
				// Get all flashcard sets associated with the authenticated user
				List<FlashcardSet> flashcardSets = user.get().getFlashcardSets();

				return ResponseEntity.ok(flashcardSets); // Return the list of flashcard sets
			} else {
				return ResponseEntity.notFound().build(); // Return 404 if user is not found
			}
		} catch (FirebaseAuthException e) {
			// If the token is invalid or expired, return a 401 Unauthorized response
			return ResponseEntity.status(401).body(null);
		} catch (Exception e) {
			// Handle any other errors
			return ResponseEntity.status(500).body(null);
		}
	}

	// Get a single FlashcardSet by ID of a User
	@GetMapping("/{userId}/flashcardSets/{setId}")
	public ResponseEntity<FlashcardSet> getFlashcardSetById(@RequestHeader("Authorization") String firebaseId,
			@PathVariable("setId") String setId) {

		try {
			String idToken = firebaseId.replace("Bearer ", "");
			FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
			String uid = decodedToken.getUid(); // Get UID from Firebase

			Optional<User> user = userRepository.findById(uid);

			if (user.isPresent()) {
				FlashcardSet set = user.get().getFlashcardSets().stream().filter(s -> s.getId().equals(setId))
						.findFirst().orElse(null);

				if (set != null) {
					return ResponseEntity.ok(set); // Return found flashcard set
				} else {
					return ResponseEntity.notFound().build(); // Set not found
				}
			} else {
				return ResponseEntity.notFound().build(); // User not found
			}
		} catch (Exception e) {
			return ResponseEntity.notFound().build(); // User not found
		}
	}

	// Get all Flashcards of a set of a single user
	@GetMapping("/{userId}/flashcardSets/{setId}/flashcards")
	public ResponseEntity<List<Flashcard>> getAllFlashcardsOfASet(@PathVariable("setId") String setId,
			@RequestHeader("Authorization") String firebaseId) {

		try {
			String idToken = firebaseId.replace("Bearer ", "");
			FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
			String uid = decodedToken.getUid(); // Get UID from Firebase

			// Find the user by userId
			Optional<User> user = userRepository.findById(uid);

			// Check if the user exists
			if (user.isPresent()) {
				// Get the flashcard sets list
				List<FlashcardSet> flashcardSets = user.get().getFlashcardSets();

				// Check if the flashcard sets are not null and not empty
				if (flashcardSets != null && !flashcardSets.isEmpty()) {
					// Find the flashcard set by setId
					FlashcardSet flashcardSet = flashcardSets.stream().filter(set -> set.getId().equals(setId))
							.findFirst().orElse(null);

					// If the flashcard set is found
					if (flashcardSet != null) {
						// Return all flashcards in the set
						return ResponseEntity.ok(flashcardSet.getFlashcards());
					} else {
						// Return 404 if flashcard set is not found
						return ResponseEntity.notFound().build();
					}
				} else {
					// Return 404 if no flashcard sets are found
					return ResponseEntity.notFound().build();
				}
			} else {
				// Return 404 if the user is not found
				return ResponseEntity.notFound().build();
			}
		} catch (Exception e) {
			return ResponseEntity.status(500).body(null);
		}
	}

//  Update the title of a specific FlashcardSet
	@PutMapping("/{userId}/flashcardSets/{setId}/updateTitle")
	public ResponseEntity<FlashcardSet> updateFlashcardSetTitle(@RequestHeader("Authorization") String firebaseId,
			@PathVariable("setId") String setId, @RequestBody Map<String, String> titleUpdateRequest) { // Accepting a
																										// Map
		try {
			String idToken = firebaseId.replace("Bearer ", "");
			FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
			String uid = decodedToken.getUid(); // Get UID from Firebase

			Optional<User> user = userRepository.findById(uid);

			if (user.isPresent()) {
				FlashcardSet set = user.get().getFlashcardSets().stream().filter(s -> s.getId().equals(setId))
						.findFirst().orElse(null);

				if (set != null && titleUpdateRequest.containsKey("title")) {
					set.setTitle(titleUpdateRequest.get("title")); // Update title using the map
					userRepository.save(user.get()); // Save updated user
					return ResponseEntity.ok(set); // Return updated flashcard set
				} else {
					return ResponseEntity.notFound().build(); // Set or title not found
				}
			} else {
				return ResponseEntity.notFound().build(); // User not found
			}
		} catch (Exception e) {
			return ResponseEntity.notFound().build(); // User not found
		}
	}

	// Add multiple flashcard to a flashcardSet of a single user
	@PutMapping("/{userId}/flashcardSets/{setId}/addFlashcards")
	public ResponseEntity<FlashcardSet> addFlashcardsToSet(@RequestHeader("Authorization") String firebaseId,
			@PathVariable("setId") String setId, @RequestBody List<Flashcard> flashcards) {
		try {
			String idToken = firebaseId.replace("Bearer ", "");
			FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
			String uid = decodedToken.getUid(); // Get UID from Firebase

			// Find the user by userId
			Optional<User> user = userRepository.findById(uid);
			if (!user.isPresent()) {
				return ResponseEntity.notFound().build(); // Return 404 if user is not found
			}

			// Find the flashcard set by setId
			FlashcardSet set = user.get().getFlashcardSets().stream().filter(s -> s.getId().equals(setId)).findFirst()
					.orElse(null);

			if (set == null) {
				return ResponseEntity.notFound().build(); // Return 404 if set is not found
			}

			// Add each flashcard to the set
			set.getFlashcards().addAll(flashcards);

			// Save the updated user with the added flashcards
			userRepository.save(user.get());

			return ResponseEntity.ok(set); // Return the updated flashcard set
		} catch (Exception e) {
			return ResponseEntity.notFound().build(); // Return 404 if user is not found
		}
	}

	// Updates the question and answer of a created flashcard.
	@PutMapping("/{userId}/flashcardSets/{setId}/flashcards/{flashcardId}/updateQuestionAndAnswer")
	public ResponseEntity<Flashcard> updateFlashcard(@RequestHeader("Authorization") String firebaseId,
			@PathVariable("setId") String setId, @PathVariable("flashcardId") String flashcardId,
			@RequestBody Flashcard updatedFlashcard) {
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

			// Save the user and flashcard set
			userRepository.save(user);

			return ResponseEntity.ok(flashcard); // Return the updated flashcard
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body(null); // Internal Server Error
		}
	}

	// Deletes a Flashcard
	@DeleteMapping("/{userId}/flashcardSets/{setId}/flashcards/{flashcardId}/removeFlashcard")
	public ResponseEntity<FlashcardSet> removeFlashcardFromSet(@RequestHeader("Authorization") String firebaseId,
			@PathVariable("setId") String setId, @PathVariable("flashcardId") String flashcardId) {
		try {
			// Validate Firebase token
			String idToken = firebaseId.replace("Bearer ", "");
			FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
			String uid = decodedToken.getUid();

			// Find the user by userId
			Optional<User> userOptional = userRepository.findById(uid);
			if (!userOptional.isPresent()) {
				return ResponseEntity.notFound().build(); // Return 404 if user is not found
			}
			User user = userOptional.get();

			List<FlashcardSet> flashcardSets = user.getFlashcardSets();

			if (flashcardSets == null || flashcardSets.isEmpty()) {
				return ResponseEntity.notFound().build(); // Return 404 if the user has no flashcard sets
			}

			// Find the flashcard set by setId
			FlashcardSet flashcardSet = flashcardSets.stream().filter(set -> set.getId().equals(setId)).findFirst()
					.orElse(null);

			if (flashcardSet == null) {
				return ResponseEntity.notFound().build(); // Return 404 if flashcard set is not found
			}

			// Find and remove the flashcard by flashcardId
			boolean removed = flashcardSet.getFlashcards().removeIf(flashcard -> flashcard.getId().equals(flashcardId));
			if (removed) {
				// Save the user with updated flashcard set after deletion
				userRepository.save(user);
				return ResponseEntity.ok(flashcardSet); // Return updated flashcard set
			} else {
				return ResponseEntity.notFound().build(); // Return 404 if flashcard is not found
			}
		} catch (Exception E) {
			return ResponseEntity.notFound().build(); // Return 404 if flashcard is not found
		}
	}

	// Remove a flashcard set from a user by flashcard set ID
	@DeleteMapping("/{userId}/flashcardSets/{setId}/removeFlashcardSet")
	public ResponseEntity<Void> deleteFlashcardSet(@RequestHeader("Authorization") String firebaseId,
			@PathVariable String userId, @PathVariable String setId) {
		try {
			String idToken = firebaseId.replace("Bearer ", "");
			FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
			String uid = decodedToken.getUid();

			Optional<User> userOptional = userRepository.findById(uid);
			if (!userOptional.isPresent()) {
				return ResponseEntity.notFound().build(); // User not found
			}

			User user = userOptional.get();
			boolean removed = user.getFlashcardSets().removeIf(set -> set.getId().equals(setId));

			if (!removed) {
				return ResponseEntity.notFound().build(); // Set not found
			}

			userRepository.save(user); // Save updated user
			return ResponseEntity.noContent().build(); // Successfully deleted
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).build(); // Internal server error
		}
	}

	// Delete a user by ID
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<User> deleteUser(@PathVariable String id) {
		Optional<User> user = userRepository.findById(id);

		if (user.isPresent()) {
			userRepository.deleteById(id);
			return ResponseEntity.ok(user.get()); // Return deleted user data
		} else {
			return ResponseEntity.notFound().build();
		}
	}
}
