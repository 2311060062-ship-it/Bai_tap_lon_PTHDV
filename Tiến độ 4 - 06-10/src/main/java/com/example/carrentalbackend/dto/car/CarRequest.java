package com.example.carrentalbackend.dto.car;

import com.example.carrentalbackend.enums.CarStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record CarRequest(
        @NotBlank String carName,
        String location,
        Integer quantity,
        CarStatus status,
        @NotNull Integer brandId,
        @NotNull Integer carTypeId,
        String imageUrl,
        Double latitude,
        Double longitude,
        String color,
        String description,
        String engine,
        String fuelType,
        @Pattern(regexp = "^$|^\\d{2}[A-Z]{1,2}-?\\d{3}\\.?\\d{2}$", message = "Biển số phải theo dạng 30A-123.45")
        String licensePlate,
        Integer seatCount,
        Integer year,
        BigDecimal price,
        String unit
) {
}
