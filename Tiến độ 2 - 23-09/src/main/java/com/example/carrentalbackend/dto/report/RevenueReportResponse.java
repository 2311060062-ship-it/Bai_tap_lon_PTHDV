package com.example.carrentalbackend.dto.report;

import java.util.List;

public record RevenueReportResponse(
        double totalRevenue,
        double monthRevenue,
        double remainingReceivable,
        long paidTransactions,
        List<MonthlyPoint> months,
        List<NamedValue> byCar,
        List<NamedValue> byMethod,
        List<NamedValue> byStatus
) {
}
