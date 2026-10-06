package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.dashboard.DashboardResponse;
import com.example.carrentalbackend.enums.BookingStatus;
import com.example.carrentalbackend.enums.PaymentStatus;
import com.example.carrentalbackend.repository.BookingRepository;
import com.example.carrentalbackend.repository.CarRepository;
import com.example.carrentalbackend.repository.CustomerRepository;
import com.example.carrentalbackend.repository.PaymentRepository;
import com.example.carrentalbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            CarRepository carRepository,
            BookingRepository bookingRepository,
            PaymentRepository paymentRepository
    ) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse stats() {
        double revenue = paymentRepository.findAll().stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.PAID)
                .mapToDouble(payment -> payment.getAmount() == null ? 0 : payment.getAmount())
                .sum();
        return new DashboardResponse(
                userRepository.count(),
                customerRepository.count(),
                carRepository.count(),
                bookingRepository.count(),
                bookingRepository.countByStatus(BookingStatus.PENDING),
                bookingRepository.countByStatus(BookingStatus.APPROVED),
                bookingRepository.countByStatus(BookingStatus.COMPLETED),
                bookingRepository.countByStatus(BookingStatus.CANCELLED),
                revenue
        );
    }
}
