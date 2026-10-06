package com.example.carrentalbackend.security;

import com.example.carrentalbackend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String CLAIM_TYPE = "typ";
    private static final String ACCESS_TYPE = "access";
    private static final String REFRESH_TYPE = "refresh";
    private static final String EMAIL_VERIFY_TYPE = "email_verify";

    private final SecretKey key;
    private final long expirationMs;
    private final long refreshExpirationMs;
    private final long emailVerifyExpirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs,
            @Value("${jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs,
            @Value("${jwt.email-verify-expiration-ms:86400000}") long emailVerifyExpirationMs
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
        this.emailVerifyExpirationMs = emailVerifyExpirationMs;
    }

    public String generateToken(User user) {
        return buildToken(user, expirationMs, ACCESS_TYPE);
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, refreshExpirationMs, REFRESH_TYPE);
    }

    public String generateEmailVerifyToken(User user) {
        return buildToken(user, emailVerifyExpirationMs, EMAIL_VERIFY_TYPE);
    }

    public boolean isEmailVerifyToken(String token) {
        try {
            return EMAIL_VERIFY_TYPE.equals(parse(token).get(CLAIM_TYPE, String.class));
        } catch (Exception ex) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return parse(token).getSubject();
    }

    public boolean isValid(String token) {
        return isAccessToken(token);
    }

    public boolean isAccessToken(String token) {
        try {
            String type = parse(token).get(CLAIM_TYPE, String.class);
            return type == null || ACCESS_TYPE.equals(type);
        } catch (Exception ex) {
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            return REFRESH_TYPE.equals(parse(token).get(CLAIM_TYPE, String.class));
        } catch (Exception ex) {
            return false;
        }
    }

    private String buildToken(User user, long ttlMs, String type) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + ttlMs);
        return Jwts.builder()
                .subject(user.getUserName())
                .claim("userId", user.getUserId())
                .claim("role", user.getRole().getRoleName())
                .claim(CLAIM_TYPE, type)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
