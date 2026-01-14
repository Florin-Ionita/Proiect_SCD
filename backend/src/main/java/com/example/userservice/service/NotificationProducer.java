package com.example.userservice.service;

import com.example.userservice.config.RabbitProducerConfig;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.io.Serializable;

@Service
public class NotificationProducer {

    private final RabbitTemplate rabbitTemplate;

    public NotificationProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendNotification(NotificationRequest request) {
        rabbitTemplate.convertAndSend(
                RabbitProducerConfig.EXCHANGE_NAME,
                RabbitProducerConfig.ROUTING_KEY,
                request
        );
        System.out.println("Message sent to RabbitMQ: " + request);
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NotificationRequest implements Serializable {
        private String toEmail;
        private String subject;
        private String body;
    }
}
