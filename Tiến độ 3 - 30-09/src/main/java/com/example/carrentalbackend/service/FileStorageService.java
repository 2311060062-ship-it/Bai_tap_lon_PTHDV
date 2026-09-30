package com.example.carrentalbackend.service;

import com.example.carrentalbackend.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final Map<String, String> MIME_EXT = Map.of(
            "image/jpeg", "jpg",
            "image/jpg", "jpg",
            "image/pjpeg", "jpg",
            "image/png", "png",
            "image/x-png", "png",
            "image/webp", "webp",
            "image/gif", "gif"
    );

    private final Path uploadDir;

    public FileStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException ex) {
            throw new IllegalStateException("Không tạo được thư mục lưu ảnh", ex);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chưa chọn tệp ảnh");
        }
        if (file.getSize() > 8L * 1024 * 1024) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ảnh tối đa 8MB");
        }
        String ext = resolveExtension(file);
        if (!ALLOWED.contains(ext)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF");
        }
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + ext;
        Path target = uploadDir.resolve(filename);
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Không lưu được ảnh. Thử ảnh nhỏ hơn 8MB.");
        }
        return "/uploads/" + filename;
    }

    private String resolveExtension(MultipartFile file) {
        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        int dot = original.lastIndexOf('.');
        if (dot >= 0) {
            String ext = original.substring(dot + 1).toLowerCase(Locale.ROOT);
            if (ALLOWED.contains(ext)) {
                return ext;
            }
        }
        String mime = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        return MIME_EXT.getOrDefault(mime, "");
    }
}
