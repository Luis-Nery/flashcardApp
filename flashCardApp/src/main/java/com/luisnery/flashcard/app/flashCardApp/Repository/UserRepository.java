package com.luisnery.flashcard.app.flashCardApp.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.luisnery.flashcard.app.flashCardApp.Model.User;

/**
 * Provides CRUD operations and data access functionality for the User collection in MongoDB.
 * This repository interface is automatically implemented by Spring Data MongoDB at runtime.
 *
 * Extends MongoRepository to gain access to predefined methods such as save, findById, deleteById, etc.
 *
 * @see org.springframework.data.mongodb.repository.MongoRepository
 * @see com.luisnery.flashcard.app.flashCardApp.Model.User
 */
public interface UserRepository extends MongoRepository<User, String> {

}
