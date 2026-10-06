package com.example.carrentalbackend.dto.car;

import jakarta.validation.constraints.NotBlank;

public record BrandRequest(
        @NotBlank String brandName,
        String description,
        String logoUrl
) {
}
