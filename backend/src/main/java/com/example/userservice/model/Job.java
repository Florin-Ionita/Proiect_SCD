package com.example.userservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    private String externalId; // ID-ul original de la API-ul extern (ca să nu aplicăm de 2 ori)
    private String title;
    private String company;
    private String location;
    private String url;        // Link spre anunțul original
    private String appliedAt;  // Data când a aplicat (stocată ca String ISO sau poți folosi LocalDateTime)

    public Job(String externalId, String title, String company, String location, String url) {
        this.externalId = externalId;
        this.title = title;
        this.company = company;
        this.location = location;
        this.url = url;
    }
}