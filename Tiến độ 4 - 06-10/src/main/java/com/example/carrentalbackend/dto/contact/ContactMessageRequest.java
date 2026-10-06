package com.example.carrentalbackend.dto.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactMessageRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        String phone,
        @NotBlank String messageContent
) {
}
