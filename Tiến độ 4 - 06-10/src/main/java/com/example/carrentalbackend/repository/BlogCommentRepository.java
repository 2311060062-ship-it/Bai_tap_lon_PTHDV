package com.example.carrentalbackend.repository;

import com.example.carrentalbackend.model.BlogComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlogCommentRepository extends JpaRepository<BlogComment, Integer> {
    List<BlogComment> findByBlog_BlogIdOrderByCreatedAtAsc(Integer blogId);
}
