package com.example.userservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id; // Mongo DB ID intern
    
    private String keycloakId; // UUID-ul din Keycloak (sub)

    private String username; // preferred_username
    private String email;
    private String firstName;
    private String lastName;
    
    private List<String> roles; // Roluri din Keycloak (ex: admin, client)

    private Preferences preferences; 
    
    private List<Job> appliedJobs = new ArrayList<>(); 

    public void addJob(Job job) {
        if (this.appliedJobs == null) {
            this.appliedJobs = new ArrayList<>();
        }
        this.appliedJobs.add(job);
    }
}