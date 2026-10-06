package com.example.carrentalbackend.controller.users;

import com.example.carrentalbackend.dto.car.CarResponse;
import com.example.carrentalbackend.service.CarService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cars")
@Tag(name = "car-controller")
public class FeatureCarController {

    private final CarService carService;

    public FeatureCarController(CarService carService) {
        this.carService = carService;
    }

    @GetMapping("/{id}/features")
    public CarResponse features(@PathVariable Integer id) {
        return carService.findById(id);
    }
}
