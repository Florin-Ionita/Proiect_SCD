package com.example.jobservice.controller;

import com.example.jobservice.dto.JobDto;
import com.example.jobservice.service.JobService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public List<JobDto> getJobs() {
        return jobService.fetchJobs();
    }
    
    @GetMapping("/info")
    public String getInfo() {
        try {
            return "Job Service running on: " + InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {
            return "Job Service running on unknown host";
        }
    }
}
