package com.example.carrentalbackend.controller.users;

import com.example.carrentalbackend.dto.news.CommentRequest;
import com.example.carrentalbackend.dto.news.CommentResponse;
import com.example.carrentalbackend.dto.news.NewsRequest;
import com.example.carrentalbackend.dto.news.NewsResponse;
import com.example.carrentalbackend.security.UserPrincipal;
import com.example.carrentalbackend.service.CommentService;
import com.example.carrentalbackend.service.NewsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsService newsService;
    private final CommentService commentService;

    public NewsController(NewsService newsService, CommentService commentService) {
        this.newsService = newsService;
        this.commentService = commentService;
    }

    @GetMapping
    public List<NewsResponse> findAll() {
        return newsService.findAll();
    }

    @GetMapping("/{id}")
    public NewsResponse findById(@PathVariable Integer id) {
        return newsService.findById(id);
    }

    @GetMapping("/{id}/comments")
    public List<CommentResponse> comments(@PathVariable Integer id) {
        return commentService.findByNews(id);
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse addComment(
            @PathVariable Integer id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserPrincipal current
    ) {
        return commentService.create(id, request, current);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public NewsResponse create(@Valid @RequestBody NewsRequest request, @AuthenticationPrincipal UserPrincipal current) {
        return newsService.create(request, current);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public NewsResponse update(@PathVariable Integer id, @Valid @RequestBody NewsRequest request) {
        return newsService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        newsService.delete(id);
    }
}
