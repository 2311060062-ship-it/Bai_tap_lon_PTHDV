package com.example.carrentalbackend.service;

import com.example.carrentalbackend.model.ContactMessage;
import com.example.carrentalbackend.repository.ContactMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.time.LocalDateTime;

@Component
@Order(0)
public class ContactInboxBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(ContactInboxBootstrap.class);

    private final JdbcTemplate jdbcTemplate;
    private final ContactMessageRepository contactMessageRepository;

    public ContactInboxBootstrap(JdbcTemplate jdbcTemplate, ContactMessageRepository contactMessageRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.contactMessageRepository = contactMessageRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        addColumnIfMissing("phone", "VARCHAR(32) NULL");
        addColumnIfMissing("status", "VARCHAR(32) NOT NULL DEFAULT 'NEW'");
        addColumnIfMissing("created_at", "DATETIME NULL");
        if (contactMessageRepository.count() == 0) {
            seed("Nguyễn Tiến Đạt", "datn123@gmail.com", "0987123456",
                    "Cho hỏi xe 7 chỗ ngày 23/8 còn không ạ?", LocalDateTime.now().minusHours(3));
            seed("ntd", "2311080082@hunre.edu.vn", "0912345678",
                    "Tôi muốn thuê Honda City RS cuối tuần này, shop hỗ trợ giao xe Cầu Giấy được không?",
                    LocalDateTime.now().minusHours(1));
            seed("Lê Minh Anh", "minhanh@gmail.com", "0905123456",
                    "Cần xe tự lái đi Đà Lạt 3 ngày, giá đã gồm bảo hiểm chưa?",
                    LocalDateTime.now().minusMinutes(20));
            log.info("Da seed tin nhan ho tro mau");
        }
    }

    private void addColumnIfMissing(String column, String definition) {
        if (columnExists("contact_message", column)) {
            return;
        }
        try {
            jdbcTemplate.execute("ALTER TABLE contact_message ADD COLUMN " + column + " " + definition);
        } catch (Exception ex) {
            log.warn("Bo qua ALTER contact_message.{}: {}", column, ex.getMessage());
        }
    }

    private boolean columnExists(String table, String column) {
        Boolean exists = jdbcTemplate.execute((ConnectionCallback<Boolean>) connection -> {
            DatabaseMetaData meta = connection.getMetaData();
            String catalog = connection.getCatalog();
            String schema = connection.getSchema();
            String[] tables = {table, table.toUpperCase(), table.toLowerCase()};
            String[] columns = {column, column.toUpperCase(), column.toLowerCase()};
            for (String tableName : tables) {
                for (String columnName : columns) {
                    try (ResultSet rs = meta.getColumns(catalog, schema, tableName, columnName)) {
                        if (rs.next()) {
                            return true;
                        }
                    }
                }
            }
            return false;
        });
        return Boolean.TRUE.equals(exists);
    }

    private void seed(String name, String email, String phone, String content, LocalDateTime createdAt) {
        ContactMessage message = new ContactMessage();
        message.setFullName(name);
        message.setEmail(email);
        message.setPhone(phone);
        message.setMessageContent(content);
        message.setStatus("NEW");
        message.setCreatedAt(createdAt);
        contactMessageRepository.save(message);
    }
}
