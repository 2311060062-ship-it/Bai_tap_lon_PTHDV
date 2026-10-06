package com.example.carrentalbackend.dto.report;

public record MonthlyPoint(
        String label,
        String key,
        double revenue,
        long bookings
) {
}
