package com.example.carrentalbackend.controller.admin;

import com.example.carrentalbackend.dto.car.FleetRequest;
import com.example.carrentalbackend.dto.car.FleetResponse;
import com.example.carrentalbackend.service.FleetService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/fleet")
@PreAuthorize("hasRole('ADMIN')")
public class FleetController {

    private final FleetService fleetService;

    public FleetController(FleetService fleetService) {
        this.fleetService = fleetService;
    }

    @GetMapping
    public List<FleetResponse> findAll(@RequestParam(required = false) Integer carId) {
        return fleetService.findAll(carId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FleetResponse create(@RequestBody FleetRequest request) {
        return fleetService.create(request);
    }

    @PutMapping("/{id}")
    public FleetResponse update(@PathVariable Integer id, @RequestBody FleetRequest request) {
        return fleetService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        fleetService.delete(id);
    }
}
