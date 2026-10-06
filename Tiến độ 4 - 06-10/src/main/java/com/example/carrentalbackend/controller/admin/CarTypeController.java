package com.example.carrentalbackend.controller.admin;

import com.example.carrentalbackend.dto.car.CarTypeRequest;
import com.example.carrentalbackend.dto.car.CarTypeResponse;
import com.example.carrentalbackend.dto.common.MessageResponse;
import com.example.carrentalbackend.service.CarTypeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/car-types", "/api/cartypes"})
public class CarTypeController {

    private final CarTypeService carTypeService;

    public CarTypeController(CarTypeService carTypeService) {
        this.carTypeService = carTypeService;
    }

    @GetMapping
    public List<CarTypeResponse> findAll() {
        return carTypeService.findAll();
    }

    @GetMapping("/{id}")
    public CarTypeResponse findById(@PathVariable Integer id) {
        return carTypeService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public CarTypeResponse create(@Valid @RequestBody CarTypeRequest request) {
        return carTypeService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CarTypeResponse update(@PathVariable Integer id, @Valid @RequestBody CarTypeRequest request) {
        return carTypeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public MessageResponse delete(@PathVariable Integer id) {
        carTypeService.delete(id);
        return new MessageResponse("Deleted successfully");
    }
}
