package com.cinefile.service;

import com.cinefile.model.User;
import com.cinefile.repo.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(String username, String password, String email) {
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("username_in_use");
        }
        if (email != null && !email.isBlank() && userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("email_in_use");
        }
        User u = new User();
        u.setUsername(username);
        if (email != null && !email.isBlank()) u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(password));
        return userRepository.save(u);
    }

    public User updateProfile(User u, String newName, String avatarUrl) {
        if (newName != null && !newName.isBlank() && !newName.equalsIgnoreCase(u.getUsername())) {
            if (userRepository.existsByUsernameIgnoreCase(newName)) {
                throw new IllegalArgumentException("username_in_use");
            }
            u.setUsername(newName);
        }
        if (avatarUrl != null) u.setAvatarUrl(avatarUrl);
        return userRepository.save(u);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("user_not_found"));
    }
}

