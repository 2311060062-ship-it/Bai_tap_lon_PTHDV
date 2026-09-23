package com.example.carrentalbackend.dto.common;

import java.util.List;

public record PageResponse<T>(
        long totalElements,
        List<T> content,
        int pageSize,
        int page,
        int totalPages
) {
}
