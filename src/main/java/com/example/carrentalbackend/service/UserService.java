package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.user.LockUserRequest;
import com.example.carrentalbackend.dto.user.UpdateUserRequest;
import com.example.carrentalbackend.dto.user.UserResponse;
import com.example.carrentalbackend.enums.CustomerStatus;
import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.model.User;
import com.example.carrentalbackend.repository.CustomerRepository;
import com.example.carrentalbackend.repository.UserRepository;
import com.example.carrentalbackend.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    public UserService(UserRepository userRepository, CustomerRepository customerRepository) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Integer id, UserPrincipal current) {
        if (!current.isAdmin() && !current.getUserId().equals(id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Không có quyền xem tài khoản này");
        }
        User user = userRepository.findByIdWithRole(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse update(Integer id, UpdateUserRequest request, UserPrincipal current) {
        if (!current.isAdmin() && !current.getUserId().equals(id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Không có quyền cập nhật tài khoản này");
        }
        User user = userRepository.findByIdWithRole(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setUserFullName(request.fullName());
        }
        if (request.phone() != null) {
            user.setUserPhone(request.phone());
        }
        if (request.email() != null && !request.email().isBlank()) {
            user.setUserEmail(request.email());
        }
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse lock(Integer id, LockUserRequest request) {
        User user = userRepository.findByIdWithRole(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        user.setIsActive(!request.locked());
        customerRepository.findByUser_UserId(id).ifPresent(customer -> {
            customer.setStatus(request.locked() ? CustomerStatus.LOCKED : CustomerStatus.ACTIVE);
        });
        return UserResponse.from(userRepository.save(user));
    }
}
