package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.model.Blog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlogRepository extends JpaRepository<Blog, Integer> {
    List<Blog> findAllByOrderByCreatedAtDesc();
}
