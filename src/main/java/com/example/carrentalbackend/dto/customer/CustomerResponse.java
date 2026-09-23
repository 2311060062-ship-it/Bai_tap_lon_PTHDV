package com.example.carrentalbackend.dto.customer;

import com.example.carrentalbackend.enums.CustomerStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CustomerResponse(
        Integer customerId,
        Integer userId,
        String username,
        String customerName,
        String customerEmail,
        String customerPhone,
        String customerAddress,
        LocalDate birthDate,
        String idNumber,
        String licenseNumber,
        CustomerStatus status,
        LocalDateTime createdAt
) {
}
