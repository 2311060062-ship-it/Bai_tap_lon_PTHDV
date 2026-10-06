package com.example.carrentalbackend.controller.users;

import com.example.carrentalbackend.dto.user.LockUserRequest;
import com.example.carrentalbackend.dto.user.UpdateUserRequest;
import com.example.carrentalbackend.dto.user.UserResponse;
import com.example.carrentalbackend.security.UserPrincipal;
import com.example.carrentalbackend.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Integer id, @AuthenticationPrincipal UserPrincipal current) {
        return userService.getById(id, current);
    }

    @PutMapping("/{id}")
    public UserResponse update(
            @PathVariable Integer id,
            @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserPrincipal current
    ) {
        return userService.update(id, request, current);
    }

    @PatchMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse lock(@PathVariable Integer id, @RequestBody LockUserRequest request) {
        return userService.lock(id, request);
    }
}
