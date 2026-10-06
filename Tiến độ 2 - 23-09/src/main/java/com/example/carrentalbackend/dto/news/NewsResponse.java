package com.example.carrentalbackend.dto.news;

import java.time.LocalDateTime;

public record NewsResponse(
        Integer newsId,
        String title,
        String content,
        Integer authorId,
        String authorName,
        LocalDateTime createdAt
) {
}
