package com.example.carrentalbackend.controller.users;

import com.example.carrentalbackend.dto.settings.PublicSettingsResponse;
import com.example.carrentalbackend.service.SystemSettingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
public class PublicSettingsController {

    private final SystemSettingService systemSettingService;

    public PublicSettingsController(SystemSettingService systemSettingService) {
        this.systemSettingService = systemSettingService;
    }

    @GetMapping("/public")
    public PublicSettingsResponse publicSettings() {
        return systemSettingService.publicSettings();
    }
}
