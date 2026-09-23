package com.example.carrentalbackend.dto.car;

public record FleetRequest(
        Integer carId,
        String color,
        String description,
        String engine,
        String fuelType,
        String licensePlate,
        Integer seatCount,
        Integer year
) {
}
