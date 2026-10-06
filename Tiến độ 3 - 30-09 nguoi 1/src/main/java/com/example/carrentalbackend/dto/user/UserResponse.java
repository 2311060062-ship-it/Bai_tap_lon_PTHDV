package com.example.carrentalbackend.dto.user;

import com.example.carrentalbackend.model.User;

public record UserResponse(
        Integer userId,
        String username,
        String email,
        String fullName,
        String phone,
        Boolean active,
        String role,
        Boolean emailVerified
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getUserName(),
                user.getUserEmail(),
                user.getUserFullName(),
                user.getUserPhone(),
                user.getIsActive(),
                user.getRole() != null ? user.getRole().getRoleName() : null,
                user.isEmailVerified()
        );
    }
}
