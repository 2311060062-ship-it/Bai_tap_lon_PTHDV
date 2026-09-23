package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CarRepository extends JpaRepository<Car, Integer> {

    @Query("""
            SELECT DISTINCT c FROM Car c
            JOIN FETCH c.brand
            JOIN FETCH c.carType
            WHERE (:brandId IS NULL OR c.brand.brandId = :brandId)
              AND (:carTypeId IS NULL OR c.carType.carTypeId = :carTypeId)
              AND (:keyword IS NULL OR LOWER(c.carName) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    List<Car> search(
            @Param("brandId") Integer brandId,
            @Param("carTypeId") Integer carTypeId,
            @Param("keyword") String keyword
    );

    @Query("SELECT c FROM Car c JOIN FETCH c.brand JOIN FETCH c.carType WHERE c.carId = :id")
    Optional<Car> findByIdWithRelations(@Param("id") Integer id);

    long countByBrand_BrandId(Integer brandId);

    long countByCarType_CarTypeId(Integer carTypeId);
}
