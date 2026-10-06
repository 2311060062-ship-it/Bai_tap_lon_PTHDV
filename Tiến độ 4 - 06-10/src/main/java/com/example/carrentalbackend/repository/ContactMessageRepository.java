package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.model.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Integer> {
}
