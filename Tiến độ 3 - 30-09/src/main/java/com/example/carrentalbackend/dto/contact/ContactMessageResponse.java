package com.example.carrentalbackend.dto.contact;

import java.time.LocalDateTime;

public record ContactMessageResponse(
        Integer messageId,
        String fullName,
        String email,
        String phone,
        String messageContent,
        String status,
        LocalDateTime createdAt,
        Integer userId
) {
}
