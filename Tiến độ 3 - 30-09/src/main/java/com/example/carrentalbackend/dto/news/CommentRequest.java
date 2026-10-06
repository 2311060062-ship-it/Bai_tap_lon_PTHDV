package com.example.carrentalbackend.dto.news;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest(@NotBlank String content) {
}
