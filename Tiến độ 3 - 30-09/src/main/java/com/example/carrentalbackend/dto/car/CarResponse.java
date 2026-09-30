package com.example.carrentalbackend.dto.car;

import com.example.carrentalbackend.enums.CarStatus;
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@JsonPropertyOrder({
        "id", "carName", "status", "quantity", "location", "createdDate",
        "engine", "fuelType", "seatCount", "year", "color", "licensePlate",
        "brandId", "brandName", "carTypeId", "carTypeName", "primaryImage", "imageUrls"
})
public record CarResponse(
        Integer carId,
        String carName,
        LocalDateTime createdDate,
        String imageUrl,
        String location,
        Integer quantity,
        CarStatus status,
        Integer brandId,
        String brandName,
        Integer carTypeId,
        String carTypeName,
        Double latitude,
        Double longitude,
        BigDecimal price,
        String unit,
        String color,
        String description,
        String engine,
        String fuelType,
        String licensePlate,
        Integer seatCount,
        Integer year,
        List<String> images,
        LocalDateTime rentedFrom,
        LocalDateTime rentedUntil
) {
    @JsonGetter("id")
    public Integer getId() {
        return carId;
    }

    @JsonGetter("primaryImage")
    public String getPrimaryImage() {
        return imageUrl;
    }

    @JsonGetter("imageUrls")
    public List<String> getImageUrls() {
        return images == null || images.isEmpty() ? null : images;
    }
}
