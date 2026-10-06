package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.news.NewsRequest;
import com.example.carrentalbackend.dto.news.NewsResponse;
import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.model.Blog;
import com.example.carrentalbackend.model.User;
import com.example.carrentalbackend.repository.BlogRepository;
import com.example.carrentalbackend.repository.UserRepository;
import com.example.carrentalbackend.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NewsService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    public NewsService(BlogRepository blogRepository, UserRepository userRepository) {
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<NewsResponse> findAll() {
        return blogRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public NewsResponse findById(Integer id) {
        return toResponse(get(id));
    }

    @Transactional
    public NewsResponse create(NewsRequest request, UserPrincipal current) {
        User user = userRepository.findById(current.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        Blog blog = new Blog();
        blog.setTitle(request.title());
        blog.setContent(request.content());
        blog.setUser(user);
        blog.setCreatedAt(LocalDateTime.now());
        return toResponse(blogRepository.save(blog));
    }

    @Transactional
    public NewsResponse update(Integer id, NewsRequest request) {
        Blog blog = get(id);
        blog.setTitle(request.title());
        blog.setContent(request.content());
        return toResponse(blogRepository.save(blog));
    }

    @Transactional
    public void delete(Integer id) {
        blogRepository.delete(get(id));
    }

    private Blog get(Integer id) {
        return blogRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tin tức"));
    }

    private NewsResponse toResponse(Blog blog) {
        return new NewsResponse(
                blog.getBlogId(),
                blog.getTitle(),
                blog.getContent(),
                blog.getUser() != null ? blog.getUser().getUserId() : null,
                blog.getUser() != null ? blog.getUser().getUserFullName() : null,
                blog.getCreatedAt()
        );
    }
}
