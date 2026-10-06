package com.example.carrentalbackend.dto.dashboard;

public record DashboardResponse(
        long totalUsers,
        long totalCustomers,
        long totalCars,
        long totalBookings,
        long pendingBookings,
        long approvedBookings,
        long completedBookings,
        long cancelledBookings,
        double totalRevenue
) {
}
