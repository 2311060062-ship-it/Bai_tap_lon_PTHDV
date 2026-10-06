package com.example.carrentalbackend.controller.admin;

import com.example.carrentalbackend.dto.car.CarTypePageItem;
import com.example.carrentalbackend.dto.common.PageResponse;
import com.example.carrentalbackend.service.CarTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "car-type-page", description = "GET /api/cartypes/page — phân trang loại xe")
public class CarTypePageController {

    private final CarTypeService carTypeService;

    public CarTypePageController(CarTypeService carTypeService) {
        this.carTypeService = carTypeService;
    }

    @GetMapping({"/api/cartypes/page", "/api/car-types/page"})
    @SecurityRequirements
    @Operation(summary = "GET /api/cartypes/page")
    public PageResponse<CarTypePageItem> findPage(
            @Parameter(description = "Tìm theo tên loại xe. Để trống nếu lấy tất cả.")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "Số trang, bắt đầu từ 1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Số dòng mỗi trang")
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        return carTypeService.findPage(keyword, page, pageSize);
    }
}
