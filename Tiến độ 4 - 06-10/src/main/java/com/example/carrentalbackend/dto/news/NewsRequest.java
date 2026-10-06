package com.example.carrentalbackend.dto.news;

import jakarta.validation.constraints.NotBlank;

public record NewsRequest(
        @NotBlank String title,
        @NotBlank String content
) {
}
