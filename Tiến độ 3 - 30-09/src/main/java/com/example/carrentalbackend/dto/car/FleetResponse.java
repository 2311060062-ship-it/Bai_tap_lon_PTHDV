package com.example.carrentalbackend.dto.car;

public record FleetResponse(
        Integer carDetailId,
        Integer carId,
        String carName,
        String color,
        String description,
        String engine,
        String fuelType,
        String licensePlate,
        Integer seatCount,
        Integer year
) {
}
