package com.cinefile.config;

import com.cinefile.model.User;
import com.cinefile.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Value("${cinefile.bootstrap-admin.enabled:false}")
    private boolean bootstrapEnabled;
    @Value("${cinefile.bootstrap-admin.username:admin}")
    private String adminUser;
    @Value("${cinefile.bootstrap-admin.password:admin123}")
    private String adminPass;

    public DataInitializer(UserRepository users, PasswordEncoder encoder) {
        this.users = users; this.encoder = encoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        if (!bootstrapEnabled) return;
        users.findByUsernameIgnoreCase(adminUser).ifPresentOrElse(u -> {}, () -> {
            User admin = new User();
            admin.setUsername(adminUser);
            admin.setPasswordHash(encoder.encode(adminPass));
            admin.setRole("ADMIN");
            users.save(admin);
        });
    }
}

