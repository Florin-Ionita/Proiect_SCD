package com.example.userservice.repository;

import com.example.userservice.model.NotificationLog;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<NotificationLog, String> {
}
