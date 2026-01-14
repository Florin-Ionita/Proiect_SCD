package com.example.notificationservice.service;

import com.example.notificationservice.config.RabbitMQConfig;
import com.example.notificationservice.dto.NotificationRequest;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationListener {

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void receiveMessage(NotificationRequest request) {
        System.out.println("==================================================");
        System.out.println("RECEIVED NOTIFICATION REQUEST:");
        System.out.println("TO: " + request.getToEmail());
        System.out.println("SUBJECT: " + request.getSubject());
        System.out.println("BODY: " + request.getBody());
        System.out.println("Sending email... [SIMULATION]");
        System.out.println("==================================================");
    }
}
