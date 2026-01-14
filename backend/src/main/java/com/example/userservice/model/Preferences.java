package com.example.userservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor // Constructor gol
@AllArgsConstructor // Constructor cu toți parametrii
public class Preferences {

    private String desiredRole;       // Ex: "Java Developer"
    private List<String> locations;   // Ex: ["Bucuresti", "Cluj", "Remote"]
    private String jobType;           // Ex: "Full-time", "Internship"
    private Double minSalary;         // Salariul minim acceptat
}