package com.example.carrentalbackend.controller.admin;

import com.example.carrentalbackend.dto.car.CarRequest;
import com.example.carrentalbackend.dto.car.CarResponse;
import com.example.carrentalbackend.service.CarService;
import com.example.carrentalbackend.service.FileStorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/cars")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "car-controller")
public class CarController {

    private final CarService carService;
    private final FileStorageService fileStorageService;

    public CarController(CarService carService, FileStorageService fileStorageService) {
        this.carService = carService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> uploadImage(@RequestParam("file") MultipartFile file) {
        return Map.of("url", fileStorageService.store(file));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CarResponse create(@Valid @RequestBody CarRequest request) {
        return carService.create(request);
    }

    @PutMapping("/{id}")
    public CarResponse update(@PathVariable Integer id, @Valid @RequestBody CarRequest request) {
        return carService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        carService.delete(id);
    }
}
