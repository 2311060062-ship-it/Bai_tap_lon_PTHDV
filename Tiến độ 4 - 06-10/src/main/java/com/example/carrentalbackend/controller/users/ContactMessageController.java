package com.example.carrentalbackend.controller.users;

import com.example.carrentalbackend.dto.contact.ContactMessageRequest;
import com.example.carrentalbackend.dto.contact.ContactMessageResponse;
import com.example.carrentalbackend.security.UserPrincipal;
import com.example.carrentalbackend.service.ContactMessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
@RequestMapping("/api/contact-messages")
public class ContactMessageController {

    private final ContactMessageService contactMessageService;

    public ContactMessageController(ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactMessageResponse create(
            @Valid @RequestBody ContactMessageRequest request,
            @AuthenticationPrincipal UserPrincipal current
    ) {
        return contactMessageService.create(request, current);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ContactMessageResponse> findAll() {
        return contactMessageService.findAll();
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ContactMessageResponse markRead(@PathVariable Integer id) {
        return contactMessageService.markRead(id);
    }
}
