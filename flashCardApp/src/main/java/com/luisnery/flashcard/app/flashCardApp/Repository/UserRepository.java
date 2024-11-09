package com.luisnery.flashcard.app.flashCardApp.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.luisnery.flashcard.app.flashCardApp.Model.User;

public interface UserRepository extends MongoRepository<User, String> {

}
