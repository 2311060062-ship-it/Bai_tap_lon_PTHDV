package com.example.carrentalbackend.controller.admin;

import com.example.carrentalbackend.dto.settings.PublicSettingsResponse;
import com.example.carrentalbackend.dto.settings.UpdateSettingsRequest;
import com.example.carrentalbackend.service.SystemSettingService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/settings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSettingsController {

    private final SystemSettingService systemSettingService;

    public AdminSettingsController(SystemSettingService systemSettingService) {
        this.systemSettingService = systemSettingService;
    }

    @GetMapping
    public PublicSettingsResponse get() {
        return systemSettingService.publicSettings();
    }

    @PutMapping
    public PublicSettingsResponse update(@RequestBody UpdateSettingsRequest request) {
        return systemSettingService.update(request);
    }
}
