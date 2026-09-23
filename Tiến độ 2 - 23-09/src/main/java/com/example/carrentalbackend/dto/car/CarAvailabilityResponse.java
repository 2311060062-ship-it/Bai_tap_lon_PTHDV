package com.example.carrentalbackend.dto.car;

import java.time.LocalDateTime;

public record CarAvailabilityResponse(
        boolean available,
        String message,
        LocalDateTime rentedUntil
) {
}
