package com.example.userservice.controller;

import com.example.userservice.model.User;
import com.example.userservice.model.Preferences;
import com.example.userservice.model.Job;
import com.example.userservice.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // --- ADMIN ROUTES ---

    // GET /api/users -> List all (ADMIN only)
    @GetMapping
    @PreAuthorize("hasRole('APP_ADMIN')") 
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // --- GENERAL USER ROUTES (pe bază de ID) ---
    // Aceste rute ar trebui protejate astfel încât să poți accesa doar propriul ID sau să fii admin.
    // Dar pentru simplitate acum le lăsăm deschise autentificaților sau facem verificarea în service.

    // GET /api/users/{id}
    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    // DELETE /api/users/{id} -> Șterge user (Admin sau self)
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
         userService.deleteUser(id);
    }
    
    // --- PREFERENCES CRUD ---

    @GetMapping("/{id}/preferences")
    public Preferences getUserPreferences(@PathVariable String id) {
        return userService.getUserPreferences(id);
    }
    
    // POST /api/users/{id}/preferences -> Adaugă/Creează preferințe
    @PostMapping("/{id}/preferences")
    public User addPreferences(@PathVariable String id, @RequestBody Preferences preferences) {
        return userService.updateUserPreferences(id, preferences);
    }

    // PUT /api/users/{id}/preferences -> Actualizează preferințele (același lucru ca POST în modelul nostru embeddable)
    @PutMapping("/{id}/preferences")
    public User updatePreferences(@PathVariable String id, @RequestBody Preferences preferences) {
        return userService.updateUserPreferences(id, preferences);
    }

    // DELETE /api/users/{id}/preferences -> Șterge preferințele
    @DeleteMapping("/{id}/preferences")
    public User deletePreferences(@PathVariable String id) {
        return userService.deleteUserPreferences(id);
    }

    // --- JOBS ---

    // POST /api/users/{id}/jobs -> Userul aplică la un job
    @PostMapping("/{id}/jobs")
    public User applyToJob(@PathVariable String id, @RequestBody Job job) {
        return userService.applyToJob(id, job);
    }

    // --- HELPER PTR FRONTEND (AUTO-SYNC) ---
    // Rămâne utilă pentru frontend să își ia ID-ul propriu fără să știe UUID-ul
    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        return userService.syncUserFromToken(jwt);
    }
}