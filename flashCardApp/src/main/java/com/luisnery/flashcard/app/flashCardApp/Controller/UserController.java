package com.luisnery.flashcard.app.flashCardApp.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.luisnery.flashcard.app.flashCardApp.Model.Flashcard;
import com.luisnery.flashcard.app.flashCardApp.Model.FlashcardSet;
import com.luisnery.flashcard.app.flashCardApp.Model.User;
import com.luisnery.flashcard.app.flashCardApp.Repository.UserRepository;

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
	public ResponseEntity<User> createUser(@RequestBody User user) {
		try {
			User savedUser = userRepository.save(user);
			return ResponseEntity.ok(savedUser);
		} catch (Exception e) {
			return ResponseEntity.status(500).build();
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
	public ResponseEntity<List<FlashcardSet>> getAllFlashcardSetsForUser(@PathVariable String userId) {
		Optional<User> user = userRepository.findById(userId);

		if (user.isPresent()) {
			// Get all the flashcard sets associated with the user
			List<FlashcardSet> flashcardSets = user.get().getFlashcardSets();

			return ResponseEntity.ok(flashcardSets); // Return the list of flashcard sets
		} else {
			return ResponseEntity.notFound().build(); // Return 404 if user is not found
		}
	}

	// Get a single FlashcardSet by ID of a User
	@GetMapping("/{userId}/flashcardSets/{setId}")
	public ResponseEntity<FlashcardSet> getFlashcardSetById(@PathVariable("userId") String userId,
			@PathVariable("setId") String setId) {

		Optional<User> user = userRepository.findById(userId);

		if (user.isPresent()) {
			FlashcardSet set = user.get().getFlashcardSets().stream().filter(s -> s.getId().equals(setId)).findFirst()
					.orElse(null);

			if (set != null) {
				return ResponseEntity.ok(set); // Return found flashcard set
			} else {
				return ResponseEntity.notFound().build(); // Set not found
			}
		} else {
			return ResponseEntity.notFound().build(); // User not found
		}
	}

	// Get all Flashcards of a set of a single user
	@GetMapping("/{userId}/flashcardSets/{setId}/flashcards")
	public ResponseEntity<List<Flashcard>> getAllFlashcardsOfASet(@PathVariable("userId") String userId,
	        @PathVariable("setId") String setId) {
	    
	    // Find the user by userId
	    Optional<User> user = userRepository.findById(userId);
	    
	    // Check if the user exists
	    if (user.isPresent()) {
	        // Get the flashcard sets list
	        List<FlashcardSet> flashcardSets = user.get().getFlashcardSets();
	        
	        // Check if the flashcard sets are not null and not empty
	        if (flashcardSets != null && !flashcardSets.isEmpty()) {
	            // Find the flashcard set by setId
	            FlashcardSet flashcardSet = flashcardSets.stream()
	                    .filter(set -> set.getId().equals(setId))
	                    .findFirst()
	                    .orElse(null);
	            
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
	}


//  Update the title of a specific FlashcardSet
	@PutMapping("/{userId}/flashcardSets/{setId}/updateTitle")
	public ResponseEntity<FlashcardSet> updateFlashcardSetTitle(@PathVariable("userId") String userId,
			@PathVariable("setId") String setId, @RequestBody Map<String, String> titleUpdateRequest) { // Accepting a
																										// Map

		Optional<User> user = userRepository.findById(userId);

		if (user.isPresent()) {
			FlashcardSet set = user.get().getFlashcardSets().stream().filter(s -> s.getId().equals(setId)).findFirst()
					.orElse(null);

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
	}

	@PutMapping("/{userId}/flashcardSets/{setId}/addFlashcard")
	public ResponseEntity<FlashcardSet> addFlashcardToSet(@PathVariable("userId") String userId,
			@PathVariable("setId") String setId, @RequestBody Flashcard flashcard) {

		// Find the user by userId
		Optional<User> user = userRepository.findById(userId);
		if (!user.isPresent()) {
			return ResponseEntity.notFound().build(); // Return 404 if user is not found
		}

		// Find the flashcard set by setId
		FlashcardSet set = user.get().getFlashcardSets().stream().filter(s -> s.getId().equals(setId)).findFirst()
				.orElse(null);

		// Add the flashcard to the set
		set.getFlashcards().add(flashcard);

		// Save the updated user with the added flashcard
		userRepository.save(user.get());

		return ResponseEntity.ok(set); // Return the updated flashcard set
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

	// Add a flashcard set to a user
	@PostMapping("/{id}/flashcardSets/add")
	public ResponseEntity<User> addFlashcardSet(@PathVariable String id, @RequestBody FlashcardSet flashcardSet) {
		Optional<User> userOptional = userRepository.findById(id);

		if (userOptional.isPresent()) {
			User user = userOptional.get();

			// Ensure title and flashcards are initialized
			if (flashcardSet.getTitle() == null) {
				flashcardSet.setTitle("Untitled Set");
			}
			if (flashcardSet.getFlashcards() == null) {
				flashcardSet.setFlashcards(new ArrayList<>());
			}

			// Add and save
			user.addFlashcardSet(flashcardSet);
			userRepository.save(user); // MongoDB will assign IDs here

			return ResponseEntity.ok(user);
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	// Remove a flashcard set from a user by flashcard set ID
	@DeleteMapping("/{userId}/flashcardSets/{flashcardSetId}")
	public ResponseEntity<User> removeFlashcardSetFromUser(@PathVariable String userId,
			@PathVariable String flashcardSetId) {
		Optional<User> user = userRepository.findById(userId);

		if (user.isPresent()) {
			User existingUser = user.get();
			existingUser.getFlashcardSets().removeIf(set -> set.getId().equals(flashcardSetId)); // Remove by ID
			userRepository.save(existingUser);
			return ResponseEntity.ok(existingUser);
		} else {
			return ResponseEntity.notFound().build();
		}
	}
}
