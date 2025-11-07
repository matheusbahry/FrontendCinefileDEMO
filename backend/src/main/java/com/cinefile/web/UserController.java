package com.cinefile.web;

import com.cinefile.model.User;
import com.cinefile.service.UserService;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    public UserController(UserService userService) { this.userService = userService; }

    public record UpdateReq(@Size(min=3,max=50) String username, String avatarUrl) {}

    @PutMapping("/me")
    public ResponseEntity<?> update(@AuthenticationPrincipal User user, @RequestBody UpdateReq req) {
        if (user == null) return ResponseEntity.status(401).build();
        try {
            var u = userService.updateProfile(user, req.username(), req.avatarUrl());
            return ResponseEntity.ok(Map.of("username", u.getUsername(), "avatarUrl", u.getAvatarUrl()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

