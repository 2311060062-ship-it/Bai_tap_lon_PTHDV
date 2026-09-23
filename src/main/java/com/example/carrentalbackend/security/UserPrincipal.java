package com.example.carrentalbackend.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final Integer userId;
    private final String username;
    private final String password;
    private final String role;
    private final boolean active;

    public UserPrincipal(Integer userId, String username, String password, String role, boolean active) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.role = role;
        this.active = active;
    }

    public Integer getUserId() {
        return userId;
    }

    public String getRole() {
        return role;
    }

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(role);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
