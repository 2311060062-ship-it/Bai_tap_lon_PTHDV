package com.example.carrentalbackend.dto.news;

import java.time.LocalDateTime;

public record CommentResponse(
        Integer commentId,
        String content,
        Integer userId,
        String authorName,
        LocalDateTime createdAt
) {
}
