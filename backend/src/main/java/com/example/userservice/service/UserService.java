package com.example.userservice.service;

import com.example.userservice.model.Job;
import com.example.userservice.model.NotificationLog;
import com.example.userservice.model.Preferences;
import com.example.userservice.model.User;
import com.example.userservice.repository.NotificationRepository;
import com.example.userservice.repository.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationProducer notificationProducer;

    public UserService(UserRepository userRepository, NotificationRepository notificationRepository, NotificationProducer notificationProducer) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.notificationProducer = notificationProducer;
    }

    /**
     * Sincronizează utilizatorul din tokenul JWT Keycloak în MongoDB.
     * Dacă nu există, îl creează. Dacă există, îi actualizează datele.
     */
    public User syncUserFromToken(Jwt jwt) {
        String keycloakId = jwt.getClaimAsString("sub");
        String email = jwt.getClaimAsString("email");
        String username = jwt.getClaimAsString("preferred_username");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");
        
        List<String> roles = new ArrayList<>();
        
        // 1. Extrage Realm Roles 
        // Filtrăm DOAR rolurile noastre specifice ("app_user", "app_admin")
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            Object rolesObj = realmAccess.get("roles");
            if (rolesObj instanceof List<?>) {
                List<String> allRoles = ((List<?>) rolesObj).stream()
                        .map(Object::toString)
                        .filter(rolestr -> rolestr.equals("app_admin") || rolestr.equals("app_user"))
                        .collect(Collectors.toList());

                // Păstrăm doar rolurile relevante aplicației
                if (allRoles.contains("app_admin")) {
                    roles.add("app_admin");
                }
                if (allRoles.contains("app_user")) {
                    roles.add("app_user");
                }
            }
        }
        
        // Dacă nu are niciunul, putem asigna un default (opțional)
        // if (roles.isEmpty()) roles.add("app_user");

        Optional<User> existingUser = userRepository.findByKeycloakId(keycloakId);

        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
             // Actualizăm datele în caz că s-au schimbat în Keycloak
            user.setEmail(email);
            user.setUsername(username);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRoles(roles);
        } else {
            // Creăm user nou
            user = new User();
            user.setKeycloakId(keycloakId);
            user.setEmail(email);
            user.setUsername(username);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRoles(roles);
        }

        return userRepository.save(user);
    }
    public Preferences getUserPreferences(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getPreferences();
    }

    public User updateUserPreferences(String id, Preferences preferences) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPreferences(preferences);
        
        // Trimitem notificare
        NotificationProducer.NotificationRequest notification = new NotificationProducer.NotificationRequest(
            user.getEmail(),
            "Profile Update Confirmation",
            "Your profile preferences have been successfully updated."
        );
        notificationProducer.sendNotification(notification);

        // Salvăm notificarea în baza de date pentru Admin Log
        NotificationLog log = new NotificationLog();
        log.setRecipientEmail(user.getEmail());
        log.setSubject(notification.getSubject());
        log.setBody(notification.getBody());
        log.setSentAt(LocalDateTime.now().toString());
        notificationRepository.save(log);
        
        return userRepository.save(user);
    }

    public User deleteUserPreferences(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPreferences(null);
        return userRepository.save(user);
    }

    public User applyToJob(String id, Job job) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        
        // Setăm data aplicării
        job.setAppliedAt(LocalDateTime.now().toString());
        
        user.addJob(job);
        
        // Trimitem notificare
        NotificationProducer.NotificationRequest notification = new NotificationProducer.NotificationRequest(
            user.getEmail(),
            "Job application to " + job.getCompany() + " confirmed",
            "You have successfully applied to " + job.getTitle() + " at " + job.getCompany()
        );
        notificationProducer.sendNotification(notification);

        // Salvăm notificarea în baza de date pentru Admin Log
        NotificationLog log = new NotificationLog();
        log.setRecipientEmail(user.getEmail());
        log.setSubject(notification.getSubject());
        log.setBody(notification.getBody());
        log.setSentAt(LocalDateTime.now().toString());
        notificationRepository.save(log);

        return userRepository.save(user);
    }
    
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                 .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<NotificationLog> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
    
