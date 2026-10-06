package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.model.CarType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarTypeRepository extends JpaRepository<CarType, Integer> {
    boolean existsByTypeNameIgnoreCase(String typeName);

    Page<CarType> findByTypeNameContainingIgnoreCase(String typeName, Pageable pageable);
}
