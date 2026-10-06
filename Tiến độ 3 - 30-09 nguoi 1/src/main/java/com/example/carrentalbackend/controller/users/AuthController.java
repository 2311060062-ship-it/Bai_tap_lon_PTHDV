package com.example.carrentalbackend.controller.users;

import com.example.carrentalbackend.dto.auth.LoginRequest;
import com.example.carrentalbackend.dto.auth.LoginResponse;
import com.example.carrentalbackend.dto.auth.RefreshRequest;
import com.example.carrentalbackend.dto.auth.RegisterRequest;
import com.example.carrentalbackend.dto.auth.ResendVerificationRequest;
import com.example.carrentalbackend.dto.auth.VerifyEmailRequest;
import com.example.carrentalbackend.dto.common.MessageResponse;
import com.example.carrentalbackend.dto.user.UserResponse;
import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.security.UserPrincipal;
import com.example.carrentalbackend.service.AuthService;
import com.example.carrentalbackend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/verify-email")
    public MessageResponse verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.email(), request.otp());
        return new MessageResponse("Xác thực email thành công. Hãy đăng nhập.");
    }

    @PostMapping("/resend-verification")
    public MessageResponse resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request.email());
        return new MessageResponse("Đã gửi lại mã OTP. Hãy kiểm tra hộp thư.");
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        return Map.of("message", "Đăng xuất thành công. Hãy xóa token ở phía client.");
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserPrincipal current) {
        if (current == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập hoặc token không hợp lệ");
        }
        return userService.getById(current.getUserId(), current);
    }
}
