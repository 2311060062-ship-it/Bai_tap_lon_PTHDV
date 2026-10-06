package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.report.MonthlyPoint;
import com.example.carrentalbackend.dto.report.NamedValue;
import com.example.carrentalbackend.dto.report.RevenueReportResponse;
import com.example.carrentalbackend.enums.BookingStatus;
import com.example.carrentalbackend.enums.PaymentStatus;
import com.example.carrentalbackend.model.Booking;
import com.example.carrentalbackend.model.Payment;
import com.example.carrentalbackend.repository.BookingRepository;
import com.example.carrentalbackend.repository.PaymentRepository;
import com.example.carrentalbackend.util.BookingTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private static final DateTimeFormatter MONTH_KEY = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final DateTimeFormatter MONTH_LABEL = DateTimeFormatter.ofPattern("MM/yyyy");

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    public ReportService(PaymentRepository paymentRepository, BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public RevenueReportResponse revenue() {
        List<Payment> paid = paymentRepository.findAllWithRelations().stream()
                .filter(item -> item.getStatus() == PaymentStatus.PAID)
                .toList();
        List<Booking> bookings = bookingRepository.findAll();

        double totalRevenue = paid.stream().mapToDouble(this::amountOf).sum();
        YearMonth thisMonth = YearMonth.from(LocalDate.now(BookingTime.ZONE));
        double monthRevenue = paid.stream()
                .filter(item -> item.getPaymentDate() != null && YearMonth.from(item.getPaymentDate()).equals(thisMonth))
                .mapToDouble(this::amountOf)
                .sum();
        double remaining = bookings.stream()
                .filter(item -> item.getStatus() != BookingStatus.CANCELLED)
                .mapToDouble(item -> Math.max(0, BookingService.totalOf(item) - BookingService.paidOf(item)))
                .sum();

        return new RevenueReportResponse(
                totalRevenue,
                monthRevenue,
                remaining,
                paid.size(),
                months(paid),
                groupByCar(paid),
                groupByMethod(paid),
                groupByStatus(bookings)
        );
    }

    private List<MonthlyPoint> months(List<Payment> paid) {
        YearMonth current = YearMonth.from(LocalDate.now(BookingTime.ZONE));
        Map<String, List<Payment>> grouped = paid.stream()
                .filter(item -> item.getPaymentDate() != null)
                .collect(Collectors.groupingBy(item -> YearMonth.from(item.getPaymentDate()).format(MONTH_KEY)));
        List<MonthlyPoint> points = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth month = current.minusMonths(i);
            String key = month.format(MONTH_KEY);
            List<Payment> items = grouped.getOrDefault(key, List.of());
            double revenue = items.stream().mapToDouble(this::amountOf).sum();
            long bookingCount = items.stream()
                    .map(item -> item.getBooking() != null ? item.getBooking().getBookingId() : null)
                    .filter(id -> id != null)
                    .distinct()
                    .count();
            points.add(new MonthlyPoint(month.format(MONTH_LABEL), key, revenue, bookingCount));
        }
        return points;
    }

    private List<NamedValue> groupByCar(List<Payment> paid) {
        return paid.stream()
                .collect(Collectors.groupingBy(
                        item -> item.getBooking() != null && item.getBooking().getCar() != null
                                ? item.getBooking().getCar().getCarName()
                                : "Khác",
                        Collectors.summingDouble(this::amountOf)
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue(Comparator.reverseOrder()))
                .limit(8)
                .map(entry -> new NamedValue(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<NamedValue> groupByMethod(List<Payment> paid) {
        return paid.stream()
                .collect(Collectors.groupingBy(
                        item -> item.getPaymentMethod() == null || item.getPaymentMethod().isBlank()
                                ? "Khác"
                                : item.getPaymentMethod(),
                        Collectors.summingDouble(this::amountOf)
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue(Comparator.reverseOrder()))
                .map(entry -> new NamedValue(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<NamedValue> groupByStatus(List<Booking> bookings) {
        return List.of(
                new NamedValue("PENDING", bookings.stream().filter(item -> item.getStatus() == BookingStatus.PENDING).count()),
                new NamedValue("APPROVED", bookings.stream().filter(item -> item.getStatus() == BookingStatus.APPROVED).count()),
                new NamedValue("COMPLETED", bookings.stream().filter(item -> item.getStatus() == BookingStatus.COMPLETED).count()),
                new NamedValue("CANCELLED", bookings.stream().filter(item -> item.getStatus() == BookingStatus.CANCELLED).count())
        );
    }

    private double amountOf(Payment payment) {
        return payment.getAmount() == null ? 0 : payment.getAmount();
    }
}
