package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.model.Pricing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PricingRepository extends JpaRepository<Pricing, Integer> {
    List<Pricing> findByCar_CarId(Integer carId);
}
