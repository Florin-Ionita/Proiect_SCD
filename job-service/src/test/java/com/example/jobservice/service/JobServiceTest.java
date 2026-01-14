package com.example.jobservice.service;

import com.example.jobservice.dto.JobDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private JobService jobService;

    @Test
    void fetchJobs_Success() {
        // Arrange
        JobService.ArbeitnowResponse mockResponse = new JobService.ArbeitnowResponse();
        List<JobService.ArbeitnowJob> jobs = new ArrayList<>();
        
        JobService.ArbeitnowJob job1 = new JobService.ArbeitnowJob();
        job1.setSlug("slug-1");
        job1.setTitle("Java Developer");
        job1.setCompanyName("Tech Corp");
        job1.setLocation("Remote");
        job1.setDescription("Description with <br> HTML");
        job1.setUrl("http://example.com");
        
        jobs.add(job1);
        mockResponse.setData(jobs);

        when(restTemplate.getForObject(anyString(), eq(JobService.ArbeitnowResponse.class)))
                .thenReturn(mockResponse);

        // Act
        List<JobDto> result = jobService.fetchJobs();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Java Developer", result.get(0).getTitle());
        assertEquals("Tech Corp", result.get(0).getCompany());
        // Verify HTML stripping in description
        assertFalse(result.get(0).getDescription().contains("<br>"));
    }

    @Test
    void fetchJobs_ApiFailure_ReturnsEmptyList() {
        // Arrange
        when(restTemplate.getForObject(anyString(), eq(JobService.ArbeitnowResponse.class)))
                .thenThrow(new RuntimeException("API Connection Error"));

        // Act
        List<JobDto> result = jobService.fetchJobs();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void fetchJobs_NullResponse_ReturnsEmptyList() {
        // Arrange
        when(restTemplate.getForObject(anyString(), eq(JobService.ArbeitnowResponse.class)))
                .thenReturn(null);

        // Act
        List<JobDto> result = jobService.fetchJobs();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
