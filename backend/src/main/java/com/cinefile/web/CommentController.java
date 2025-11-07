package com.cinefile.web;

import com.cinefile.model.*;
import com.cinefile.repo.CommentRepository;
import com.cinefile.repo.LogRepository;
import com.cinefile.web.dto.CommentRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CommentController {
    private final CommentRepository comments;
    private final LogRepository logs;

    public CommentController(CommentRepository comments, LogRepository logs) {
        this.comments = comments;
        this.logs = logs;
    }

    @GetMapping("/comments/{type}/{tmdbId}")
    public List<Comment> list(@PathVariable("type") String type, @PathVariable Long tmdbId) {
        MediaType mt = "series".equalsIgnoreCase(type) ? MediaType.SERIES : MediaType.MOVIE;
        return comments.findAllByMediaTypeAndTmdbIdOrderByCreatedAtDesc(mt, tmdbId);
    }

    @PostMapping("/comments")
    public ResponseEntity<?> add(@AuthenticationPrincipal User user, @Valid @RequestBody CommentRequest req) {
        if (user == null) return ResponseEntity.status(401).build();
        Comment c = new Comment();
        c.setUser(user);
        c.setMediaType(req.getMediaType());
        c.setTmdbId(req.getTmdbId());
        c.setText(req.getText());
        c.setCreatedAt(Instant.now());
        comments.save(c);

        LogEntry le = new LogEntry();
        le.setUser(user); le.setAction(ActionType.COMMENT_ADD); le.setMediaType(req.getMediaType()); le.setTmdbId(req.getTmdbId());
        le.setTs(Instant.now()); le.setDetails("comment");
        logs.save(le);

        return ResponseEntity.ok(Map.of("id", c.getId(), "createdAt", c.getCreatedAt()));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> del(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return comments.findById(id).map(c -> {
            if (!c.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).build();
            }
            comments.delete(c);
            return ResponseEntity.ok(Map.of("deleted", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/logs/me")
    public List<LogEntry> myLogs(@AuthenticationPrincipal User user, @RequestParam(defaultValue = "20") int limit) {
        int l = Math.max(1, Math.min(100, limit));
        return logs.findAllByUserOrderByTsDesc(user, PageRequest.of(0, l));
    }
}

