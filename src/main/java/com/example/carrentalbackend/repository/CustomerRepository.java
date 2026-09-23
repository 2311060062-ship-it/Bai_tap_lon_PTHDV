package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.model.Customer;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByUser_UserId(Integer userId);

    @EntityGraph(attributePaths = "user")
    List<Customer> findByCustomerNameContainingIgnoreCase(String name);

    @EntityGraph(attributePaths = "user")
    @Query("select c from Customer c")
    List<Customer> findAllWithUser();

    @EntityGraph(attributePaths = "user")
    @Query("select c from Customer c where c.customerId = :id")
    Optional<Customer> findWithUserById(Integer id);
}
