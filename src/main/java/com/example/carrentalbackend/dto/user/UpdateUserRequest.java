package com.example.carrentalbackend.dto.user;

public record UpdateUserRequest(
        String fullName,
        String phone,
        String email
) {
}
