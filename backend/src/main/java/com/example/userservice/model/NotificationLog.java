package com.example.userservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "notification_logs")
public class NotificationLog {
    @Id
    private String id;
    private String recipientEmail;
    private String subject;
    private String body;
    private String sentAt;
}
