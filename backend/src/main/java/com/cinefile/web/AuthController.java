package com.cinefile.web;

import com.cinefile.model.User;
import com.cinefile.service.JwtService;
import com.cinefile.service.UserService;
import com.cinefile.web.dto.LoginRequest;
import com.cinefile.web.dto.TokenResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserService userService, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody com.cinefile.web.dto.RegisterRequest req) {
        try {
            User u = userService.register(req.getUsername().trim(), req.getPassword(), req.getEmail());
            String token = jwtService.generate(u.getUsername(), Map.of("role", u.getRole()));
            return ResponseEntity.ok(new TokenResponse(token, u.getUsername(), u.getRole()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        var ud = userService.loadUserByUsername(req.getUsername());
        if (!passwordEncoder.matches(req.getPassword(), ud.getPassword())) {
            throw new BadCredentialsException("invalid_credentials");
        }
        var u = (User) ud;
        String token = jwtService.generate(u.getUsername(), Map.of("role", u.getRole()));
        return ResponseEntity.ok(new TokenResponse(token, u.getUsername(), u.getRole()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "avatarUrl", user.getAvatarUrl(),
                "role", user.getRole()
        ));
    }
}

