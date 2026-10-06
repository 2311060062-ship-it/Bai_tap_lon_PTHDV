package com.example.carrentalbackend.service;

import com.example.carrentalbackend.model.Role;
import com.example.carrentalbackend.model.User;
import com.example.carrentalbackend.repository.RoleRepository;
import com.example.carrentalbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Order(1)
@ConditionalOnProperty(name = "app.seed-admin", havingValue = "true")
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByUserName("admin")) {
            return;
        }
        Role adminRole = roleRepository.findByRoleName("ADMIN").orElse(null);
        if (adminRole == null) {
            log.warn("Bo qua seed admin vi chua co role ADMIN. Hay import database/car_rental.sql");
            return;
        }
        User admin = new User();
        admin.setUserName("admin");
        admin.setUserEmail("admin@carrental.com");
        admin.setUserFullName("Quan tri vien");
        admin.setUserPhone("0900000000");
        admin.setUserPassword(passwordEncoder.encode("Admin@123"));
        admin.setIsActive(true);
        admin.setEmailVerifiedAt(LocalDateTime.now());
        admin.setRole(adminRole);
        userRepository.save(admin);
        log.info("Da tao tai khoan admin mac dinh: admin / Admin@123");
    }
}
