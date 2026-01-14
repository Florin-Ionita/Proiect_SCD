package com.example.jobservice.service;

import com.example.jobservice.dto.JobDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.CacheManager;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SpringBootTest
class JobServiceCachingTest {

    @Autowired
    private JobService jobService;

    @MockBean
    private RestTemplate restTemplate;

    @Autowired
    private CacheManager cacheManager;

    @Test
    void testCaching_MultipleCalls_TriggerOnlyOneApiRequest() {
        // Arrange: Pregătim un răspuns mock de la API
        JobService.ArbeitnowResponse mockResponse = new JobService.ArbeitnowResponse();
        List<JobService.ArbeitnowJob> jobs = new ArrayList<>();
        JobService.ArbeitnowJob job1 = new JobService.ArbeitnowJob();
        job1.setSlug("cached-job");
        job1.setTitle("Cached Dev");
        job1.setCompanyName("Cache Corp");
        job1.setLocation("Memory");
        job1.setDescription("Desc");
        jobs.add(job1);
        mockResponse.setData(jobs);

        when(restTemplate.getForObject(anyString(), eq(JobService.ArbeitnowResponse.class)))
                .thenReturn(mockResponse);

        // Curățăm cache-ul înainte de test pentru a fi siguri
        cacheManager.getCache("jobs").clear();

        // Act 1: Primul apel -> Ar trebui să execute metoda și să apeleze RestTemplate
        System.out.println("--- Apel 1 ---");
        List<JobDto> result1 = jobService.fetchJobs();

        // Act 2: Al doilea apel -> Ar trebui să vină din Cache, fără a apela RestTemplate
        System.out.println("--- Apel 2 ---");
        List<JobDto> result2 = jobService.fetchJobs();

        // Assert
        assertEquals(1, result1.size());
        assertEquals(1, result2.size());
        assertEquals("Cached Dev", result1.get(0).getTitle());
        assertEquals("Cached Dev", result2.get(0).getTitle());

        // Verificăm esența caching-ului: 
        // Metoda 'getForObject' a RestTemplate a fost apelată exact O DATĂ (doar la primul apel)
        verify(restTemplate, times(1)).getForObject(anyString(), eq(JobService.ArbeitnowResponse.class));
    }
}
