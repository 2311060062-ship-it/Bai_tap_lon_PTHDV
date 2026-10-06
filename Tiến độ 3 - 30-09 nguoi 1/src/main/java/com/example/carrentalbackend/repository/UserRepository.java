package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUserName(String userName);

    Optional<User> findByUserEmail(String userEmail);

    boolean existsByUserName(String userName);

    boolean existsByUserEmail(String userEmail);

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.userName = :userName")
    Optional<User> findByUserNameWithRole(@Param("userName") String userName);

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.userEmail = :email")
    Optional<User> findByUserEmailWithRole(@Param("email") String email);

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.userId = :id")
    Optional<User> findByIdWithRole(@Param("id") Integer id);
}
