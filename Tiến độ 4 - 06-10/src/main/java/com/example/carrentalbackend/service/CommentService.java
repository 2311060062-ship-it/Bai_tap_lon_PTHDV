package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.news.CommentRequest;
import com.example.carrentalbackend.dto.news.CommentResponse;
import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.model.Blog;
import com.example.carrentalbackend.model.BlogComment;
import com.example.carrentalbackend.model.User;
import com.example.carrentalbackend.repository.BlogCommentRepository;
import com.example.carrentalbackend.repository.BlogRepository;
import com.example.carrentalbackend.repository.UserRepository;
import com.example.carrentalbackend.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    private final BlogCommentRepository commentRepository;
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    public CommentService(
            BlogCommentRepository commentRepository,
            BlogRepository blogRepository,
            UserRepository userRepository
    ) {
        this.commentRepository = commentRepository;
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> findByNews(Integer newsId) {
        return commentRepository.findByBlog_BlogIdOrderByCreatedAtAsc(newsId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CommentResponse create(Integer newsId, CommentRequest request, UserPrincipal current) {
        Blog blog = blogRepository.findById(newsId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tin tức"));
        User user = userRepository.findById(current.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        BlogComment comment = new BlogComment();
        comment.setBlog(blog);
        comment.setUser(user);
        comment.setCommentContent(request.content().trim());
        comment.setCreatedAt(LocalDateTime.now());
        return toResponse(commentRepository.save(comment));
    }

    private CommentResponse toResponse(BlogComment comment) {
        return new CommentResponse(
                comment.getCommentId(),
                comment.getCommentContent(),
                comment.getUser() != null ? comment.getUser().getUserId() : null,
                comment.getUser() != null ? comment.getUser().getUserFullName() : null,
                comment.getCreatedAt()
        );
    }
}
