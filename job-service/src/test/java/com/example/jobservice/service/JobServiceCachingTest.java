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
        // Arrange: Pregatim un raspuns mock de la API
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

        // Curatam cache-ul inainte de test pentru a fi siguri
        cacheManager.getCache("jobs").clear();

        // Primul apel ar trebui sa execute metoda si sa apeleze RestTemplate
        System.out.println("--- Apel 1 ---");
        List<JobDto> result1 = jobService.fetchJobs();

        // Al doilea apel ar trebui sa vina din Cache, fara a apela RestTemplate
        System.out.println("--- Apel 2 ---");
        List<JobDto> result2 = jobService.fetchJobs();

        // Assert
        assertEquals(1, result1.size());
        assertEquals(1, result2.size());
        assertEquals("Cached Dev", result1.get(0).getTitle());
        assertEquals("Cached Dev", result2.get(0).getTitle());

        // Verificam esenta caching-ului: 
        // Metoda 'getForObject' a RestTemplate a fost apelata exact O DATA (doar la primul apel)
        verify(restTemplate, times(1)).getForObject(anyString(), eq(JobService.ArbeitnowResponse.class));
    }
}
