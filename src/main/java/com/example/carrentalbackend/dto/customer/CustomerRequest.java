package com.example.carrentalbackend.dto.customer;

import com.example.carrentalbackend.enums.CustomerStatus;

import java.time.LocalDate;

public record CustomerRequest(
        String username,
        String email,
        String password,
        String customerName,
        String customerPhone,
        String customerAddress,
        LocalDate birthDate,
        String idNumber,
        String licenseNumber,
        CustomerStatus status
) {
}
