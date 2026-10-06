package com.example.carrentalbackend.controller.admin;

import com.example.carrentalbackend.dto.report.RevenueReportResponse;
import com.example.carrentalbackend.service.ReportService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public RevenueReportResponse revenue() {
        return reportService.revenue();
    }
}
