package com.example.jobservice.dto;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobDto implements Serializable {
    private String id;
    private String title;
    private String company;
    private String location;
    private String description;
    private String url;
}
