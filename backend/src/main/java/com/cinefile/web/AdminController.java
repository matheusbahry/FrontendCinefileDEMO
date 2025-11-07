package com.cinefile.web;

import com.cinefile.model.User;
import com.cinefile.repo.UserRepository;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserRepository users;

    public AdminController(UserRepository users) {
        this.users = users;
    }

    @GetMapping("/users")
    public List<Map<String,Object>> listUsers() {
        return users.findAll().stream().map(u -> Map.of(
                "id", u.getId(),
                "username", u.getUsername(),
                "email", u.getEmail(),
                "role", u.getRole(),
                "createdAt", u.getCreatedAt()
        )).toList();
    }

    public record RoleReq(@NotBlank String role) {}

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> setRole(@PathVariable Long id, @RequestBody RoleReq req) {
        return users.findById(id).map(u -> {
            u.setRole(req.role().equalsIgnoreCase("ADMIN") ? "ADMIN" : "USER");
            users.save(u);
            return ResponseEntity.ok(Map.of("id", u.getId(), "role", u.getRole()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!users.existsById(id)) return ResponseEntity.notFound().build();
        try {
            users.deleteById(id);
            return ResponseEntity.ok(Map.of("deleted", true));
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            return ResponseEntity.status(409).body(Map.of(
                    "error", "user_has_related_data",
                    "message", "Não é possível excluir usuário com dados relacionados (comentários, notas, watchlist)."
            ));
        }
    }
}
