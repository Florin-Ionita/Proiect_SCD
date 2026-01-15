package com.example.jobservice.service;

import com.example.jobservice.dto.JobDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final RestTemplate restTemplate;

    public JobService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Apel real către API-ul public gratuit Arbeitnow
    @Cacheable(value = "jobs", key = "'allJobs'")
    public List<JobDto> fetchJobs() {
        System.out.println("--- Fetching jobs from Real API (Arbeitnow) ---");
        
        String apiUrl = "https://arbeitnow.com/api/job-board-api";
        
        try {
            ArbeitnowResponse response = restTemplate.getForObject(apiUrl, ArbeitnowResponse.class);
            
            if (response != null && response.getData() != null) {
                return response.getData().stream()
                    .map(this::mapToJobDto)
                    .limit(100) // Limităm la 100 de joburi pentru demo
                    .collect(Collectors.toList());
            }
        } catch (Exception e) {
            System.err.println("Eroare la apelul API extern: " + e.getMessage());
        }

        // Fallback în caz de eroare
        return new ArrayList<>();
    }

    private JobDto mapToJobDto(ArbeitnowJob apiJob) {
        String plainTextDescription = apiJob.getDescription().replaceAll("<[^>]*>", "");
        String truncatedDescription = plainTextDescription.substring(0, Math.min(plainTextDescription.length(), 200)) + "...";
        
        return new JobDto(
            apiJob.getSlug(),
            apiJob.getTitle(),
            apiJob.getCompanyName(),
            apiJob.getLocation(),
            truncatedDescription, 
            apiJob.getUrl()
        );
    }

@Data
    static class ArbeitnowResponse {
        private List<ArbeitnowJob> data;
    }

    @Data
    static class ArbeitnowJob {
        private String slug;
        @JsonProperty("company_name")
        private String companyName;
        private String title;
        private String description;
        private boolean remote;
        private String url;
        private List<String> tags;
        private List<String> job_types;
        private String location;
        private long created_at;
    }
}
