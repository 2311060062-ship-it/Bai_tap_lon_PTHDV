package com.example.carrentalbackend.controller.users;

import com.example.carrentalbackend.dto.car.CarAvailabilityResponse;
import com.example.carrentalbackend.dto.car.CarResponse;
import com.example.carrentalbackend.enums.CarStatus;
import com.example.carrentalbackend.service.CarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/cars")
@Tag(name = "car-controller")
public class CarUserController {

    private final CarService carService;

    public CarUserController(CarService carService) {
        this.carService = carService;
    }

    @GetMapping
    public List<CarResponse> search(
            @RequestParam(required = false) Integer brandId,
            @RequestParam(required = false) Integer carTypeId,
            @RequestParam(required = false) CarStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return carService.search(brandId, carTypeId, status, keyword, maxPrice);
    }

    @GetMapping("/{id}/availability")
    public CarAvailabilityResponse availability(
            @PathVariable Integer id,
            @RequestParam LocalDate pickupDate,
            @RequestParam LocalDate returnDate,
            @RequestParam(required = false) LocalTime pickupTime,
            @RequestParam(required = false) LocalTime returnTime
    ) {
        return carService.availability(id, pickupDate, returnDate, pickupTime, returnTime);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get car by id")
    public CarResponse findById(@PathVariable Integer id) {
        return carService.findById(id);
    }
}
