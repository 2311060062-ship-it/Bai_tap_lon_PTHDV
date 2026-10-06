package com.example.carrentalbackend.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

public record LoginResponse(
        @Schema(description = "Copy nguyên chuỗi này dán vào ổ khóa Authorize", example = "eyJhbGciOiJIUzI1NiJ9...")
        String token,
        String tokenType,
        Integer userId,
        String username,
        String fullName,
        String email,
        String role,
        Boolean emailVerified,
        String refreshToken
) {
}
