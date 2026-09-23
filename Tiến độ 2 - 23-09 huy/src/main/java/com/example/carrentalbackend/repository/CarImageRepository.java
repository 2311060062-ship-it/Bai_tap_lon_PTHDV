package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.model.CarImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarImageRepository extends JpaRepository<CarImage, Integer> {
    List<CarImage> findByCar_CarId(Integer carId);
}
