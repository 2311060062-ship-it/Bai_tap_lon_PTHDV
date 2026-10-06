package com.example.carrentalbackend.security;

import com.example.carrentalbackend.model.User;
import com.example.carrentalbackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUserNameWithRole(username)
                .or(() -> userRepository.findByUserEmailWithRole(username))
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản"));
        return new UserPrincipal(
                user.getUserId(),
                user.getUserName(),
                user.getUserPassword(),
                user.getRole().getRoleName(),
                Boolean.TRUE.equals(user.getIsActive())
        );
    }
}
