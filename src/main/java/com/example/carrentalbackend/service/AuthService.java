package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.auth.LoginRequest;
import com.example.carrentalbackend.dto.auth.LoginResponse;
import com.example.carrentalbackend.dto.auth.RegisterRequest;
import com.example.carrentalbackend.dto.user.UserResponse;
import com.example.carrentalbackend.enums.CustomerStatus;
import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.model.Customer;
import com.example.carrentalbackend.model.Role;
import com.example.carrentalbackend.model.User;
import com.example.carrentalbackend.repository.CustomerRepository;
import com.example.carrentalbackend.repository.RoleRepository;
import com.example.carrentalbackend.repository.UserRepository;
import com.example.carrentalbackend.security.JwtService;
import com.example.carrentalbackend.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RoleRepository roleRepository,
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            MailService mailService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String login = request.username() == null ? "" : request.username().trim();
        User user = userRepository.findByUserNameWithRole(login)
                .or(() -> userRepository.findByUserEmailWithRole(login))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tên đăng nhập hoặc email không tồn tại"));
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUserName(), request.password()));
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Mật khẩu không đúng");
        }
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa");
        }
        if (!user.isEmailVerified() && !"ADMIN".equalsIgnoreCase(user.getRole().getRoleName())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Vui lòng xác thực email trước khi đăng nhập. Kiểm tra mã OTP trong hộp thư hoặc gửi lại mã.");
        }
        return toLoginResponse(user);
    }

    @Transactional(readOnly = true)
    public LoginResponse refresh(String refreshToken) {
        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập hết hạn. Hãy đăng nhập lại.");
        }
        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByUserNameWithRole(username)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại"));
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa");
        }
        return toLoginResponse(user);
    }

    private LoginResponse toLoginResponse(User user) {
        return new LoginResponse(
                jwtService.generateToken(user),
                "Bearer",
                user.getUserId(),
                user.getUserName(),
                user.getUserFullName(),
                user.getUserEmail(),
                user.getRole().getRoleName(),
                user.isEmailVerified(),
                jwtService.generateRefreshToken(user)
        );
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUserName(request.username())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tên đăng nhập đã tồn tại");
        }
        if (userRepository.existsByUserEmail(request.email())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email đã tồn tại");
        }
        Role role = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Chưa seed role USER"));

        User user = new User();
        user.setUserName(request.username());
        user.setUserEmail(request.email());
        user.setUserFullName(request.fullName());
        user.setUserPhone(request.phone());
        user.setUserPassword(passwordEncoder.encode(request.password()));
        user.setIsActive(true);
        user.setEmailVerifiedAt(null);
        user.setRole(role);
        userRepository.save(user);

        Customer customer = new Customer();
        customer.setUser(user);
        customer.setCustomerName(request.fullName());
        customer.setCustomerEmail(request.email());
        customer.setCustomerPhone(request.phone());
        customer.setCustomerAddress(request.address());
        customer.setStatus(CustomerStatus.ACTIVE);
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(customer);

        sendOtp(user);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse verifyEmail(String email, String otp) {
        User user = userRepository.findByUserEmailWithRole(email.trim())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy email này"));
        if (user.isEmailVerified()) {
            return UserResponse.from(user);
        }
        if (user.getEmailOtp() == null || user.getEmailOtpExpiresAt() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chưa có mã OTP. Hãy bấm gửi lại mã.");
        }
        if (user.getEmailOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã OTP đã hết hạn. Hãy gửi lại mã mới.");
        }
        if (!user.getEmailOtp().equals(otp.trim())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã OTP không đúng");
        }
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setEmailOtp(null);
        user.setEmailOtpExpiresAt(null);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void resendVerification(String email) {
        User user = userRepository.findByUserEmailWithRole(email.trim())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy email này"));
        if (user.isEmailVerified()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email đã được xác thực. Hãy đăng nhập.");
        }
        sendOtp(user);
    }

    private void sendOtp(User user) {
        String otp = String.format("%06d", java.util.concurrent.ThreadLocalRandom.current().nextInt(0, 1_000_000));
        user.setEmailOtp(otp);
        user.setEmailOtpExpiresAt(LocalDateTime.now().plusSeconds(120));
        userRepository.save(user);
        mailService.sendOtpEmail(user, otp);
    }

    public void requireVerified(UserPrincipal current) {
        if (current == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập hoặc token không hợp lệ");
        }
        if (current.isAdmin()) {
            return;
        }
        User user = userRepository.findById(current.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        if (!user.isEmailVerified()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Vui lòng xác thực email trước khi đặt xe hoặc thanh toán");
        }
    }
}
