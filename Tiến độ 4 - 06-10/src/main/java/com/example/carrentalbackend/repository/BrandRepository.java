package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Integer> {
    boolean existsByBrandNameIgnoreCase(String brandName);
}
