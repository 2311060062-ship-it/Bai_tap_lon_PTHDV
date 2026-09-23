package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.model.CarDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarDetailRepository extends JpaRepository<CarDetail, Integer> {
    List<CarDetail> findByCar_CarId(Integer carId);

    long countByBrand_BrandId(Integer brandId);
}
