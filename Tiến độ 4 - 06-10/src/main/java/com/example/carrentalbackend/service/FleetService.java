package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.car.FleetRequest;
import com.example.carrentalbackend.dto.car.FleetResponse;
import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.model.Car;
import com.example.carrentalbackend.model.CarDetail;
import com.example.carrentalbackend.repository.CarDetailRepository;
import com.example.carrentalbackend.repository.CarRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FleetService {

    private final CarDetailRepository carDetailRepository;
    private final CarRepository carRepository;

    public FleetService(CarDetailRepository carDetailRepository, CarRepository carRepository) {
        this.carDetailRepository = carDetailRepository;
        this.carRepository = carRepository;
    }

    @Transactional(readOnly = true)
    public List<FleetResponse> findAll(Integer carId) {
        List<CarDetail> details = carId == null
                ? carDetailRepository.findAll()
                : carDetailRepository.findByCar_CarId(carId);
        return details.stream().map(this::toResponse).toList();
    }

    @Transactional
    public FleetResponse create(FleetRequest request) {
        Car car = carRepository.findById(request.carId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy xe"));
        CarDetail detail = new CarDetail();
        apply(detail, request, car);
        return toResponse(carDetailRepository.save(detail));
    }

    @Transactional
    public FleetResponse update(Integer id, FleetRequest request) {
        CarDetail detail = carDetailRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết xe"));
        Car car = request.carId() == null
                ? detail.getCar()
                : carRepository.findById(request.carId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy xe"));
        apply(detail, request, car);
        return toResponse(carDetailRepository.save(detail));
    }

    @Transactional
    public void delete(Integer id) {
        CarDetail detail = carDetailRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết xe"));
        carDetailRepository.delete(detail);
    }

    private void apply(CarDetail detail, FleetRequest request, Car car) {
        detail.setCar(car);
        detail.setBrand(car.getBrand());
        detail.setColor(request.color());
        detail.setDescription(request.description());
        detail.setEngine(request.engine());
        detail.setFuelType(request.fuelType());
        detail.setLicensePlate(request.licensePlate());
        detail.setSeatCount(request.seatCount());
        detail.setYear(request.year());
    }

    private FleetResponse toResponse(CarDetail detail) {
        return new FleetResponse(
                detail.getCarDetailId(),
                detail.getCar() != null ? detail.getCar().getCarId() : null,
                detail.getCar() != null ? detail.getCar().getCarName() : null,
                detail.getColor(),
                detail.getDescription(),
                detail.getEngine(),
                detail.getFuelType(),
                detail.getLicensePlate(),
                detail.getSeatCount(),
                detail.getYear()
        );
    }
}
