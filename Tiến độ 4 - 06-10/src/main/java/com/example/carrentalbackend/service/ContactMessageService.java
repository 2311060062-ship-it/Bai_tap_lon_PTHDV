package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.contact.ContactMessageRequest;
import com.example.carrentalbackend.dto.contact.ContactMessageResponse;
import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.model.ContactMessage;
import com.example.carrentalbackend.repository.ContactMessageRepository;
import com.example.carrentalbackend.repository.UserRepository;
import com.example.carrentalbackend.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;
    private final UserRepository userRepository;

    public ContactMessageService(
            ContactMessageRepository contactMessageRepository,
            UserRepository userRepository
    ) {
        this.contactMessageRepository = contactMessageRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ContactMessageResponse create(ContactMessageRequest request, UserPrincipal current) {
        ContactMessage message = new ContactMessage();
        message.setFullName(request.fullName().trim());
        message.setEmail(request.email().trim());
        message.setPhone(StringUtils.hasText(request.phone()) ? request.phone().trim() : null);
        message.setMessageContent(request.messageContent().trim());
        message.setStatus("NEW");
        message.setCreatedAt(LocalDateTime.now());
        if (current != null) {
            userRepository.findById(current.getUserId()).ifPresent(user -> {
                message.setUser(user);
                if (!StringUtils.hasText(message.getPhone()) && StringUtils.hasText(user.getUserPhone())) {
                    message.setPhone(user.getUserPhone());
                }
            });
        }
        return toResponse(contactMessageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<ContactMessageResponse> findAll() {
        return contactMessageRepository.findAll().stream()
                .sorted(Comparator.comparing(ContactMessage::getMessageId).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ContactMessageResponse markRead(Integer id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tin nhắn"));
        message.setStatus("READ");
        return toResponse(contactMessageRepository.save(message));
    }

    private ContactMessageResponse toResponse(ContactMessage message) {
        return new ContactMessageResponse(
                message.getMessageId(),
                message.getFullName(),
                message.getEmail(),
                message.getPhone(),
                message.getMessageContent(),
                message.getStatus() == null ? "NEW" : message.getStatus(),
                message.getCreatedAt(),
                message.getUser() != null ? message.getUser().getUserId() : null
        );
    }
}
