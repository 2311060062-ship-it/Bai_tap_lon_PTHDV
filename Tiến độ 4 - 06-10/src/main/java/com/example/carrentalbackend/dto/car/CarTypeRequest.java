package com.example.carrentalbackend.dto.car;

import jakarta.validation.constraints.NotBlank;

public record CarTypeRequest(@NotBlank String typeName) {
}
