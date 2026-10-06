package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.settings.PublicSettingsResponse;
import com.example.carrentalbackend.dto.settings.UpdateSettingsRequest;
import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.model.SystemSetting;
import com.example.carrentalbackend.repository.SystemSettingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class SystemSettingService {

    public static final String KEY_ZALO = "zalo_phone";
    public static final String DEFAULT_ZALO = "0987654321";
    public static final String DEFAULT_HOTLINE = "19006868";
    public static final String DEFAULT_EMAIL = "support@carrental.vn";

    private final SystemSettingRepository systemSettingRepository;

    public SystemSettingService(SystemSettingRepository systemSettingRepository) {
        this.systemSettingRepository = systemSettingRepository;
    }

    @Transactional(readOnly = true)
    public PublicSettingsResponse publicSettings() {
        return new PublicSettingsResponse(currentZalo(), DEFAULT_HOTLINE, DEFAULT_EMAIL);
    }

    @Transactional
    public PublicSettingsResponse update(UpdateSettingsRequest request) {
        String zalo = normalizeVnMobile(request == null ? null : request.zaloPhone());
        if (!StringUtils.hasText(zalo)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nhập số Zalo di động 10 số (ví dụ 0912345678). Không dùng 1900.");
        }
        systemSettingRepository.save(new SystemSetting(KEY_ZALO, zalo));
        return publicSettings();
    }

    private String currentZalo() {
        return systemSettingRepository.findById(KEY_ZALO)
                .map(SystemSetting::getSettingValue)
                .filter(StringUtils::hasText)
                .orElse(DEFAULT_ZALO);
    }

    static String normalizeVnMobile(String phone) {
        if (!StringUtils.hasText(phone)) {
            return "";
        }
        String digits = phone.replaceAll("\\D", "");
        if (digits.startsWith("84") && digits.length() >= 11) {
            digits = "0" + digits.substring(2);
        }
        return digits.matches("0[3-9]\\d{8}") ? digits : "";
    }
}
