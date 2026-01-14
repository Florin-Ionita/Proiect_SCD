package com.example.userservice.repository;

import com.example.userservice.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    // Găsim userul după ID-ul unic din Keycloak (sub)
    Optional<User> findByKeycloakId(String keycloakId);
}