package com.cinefile.web;

import com.cinefile.model.ActionType;
import com.cinefile.model.LogEntry;
import com.cinefile.model.MediaType;
import com.cinefile.model.User;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watched")
public class WatchedController {
    private final com.cinefile.repo.LogRepository logs;
    public WatchedController(com.cinefile.repo.LogRepository logs) { this.logs = logs; }

    public record WatchedReq(@NotNull MediaType mediaType, @NotNull Long tmdbId, String dateIso) {}

    @PostMapping
    public ResponseEntity<?> add(@AuthenticationPrincipal User user, @RequestBody WatchedReq req) {
        if (user == null) return ResponseEntity.status(401).build();
        LogEntry le = new LogEntry();
        le.setUser(user);
        le.setAction(ActionType.WATCHED);
        le.setMediaType(req.mediaType());
        le.setTmdbId(req.tmdbId());
        if (req.dateIso() != null && !req.dateIso().isBlank())
            le.setTs(Instant.parse(req.dateIso()));
        else le.setTs(Instant.now());
        logs.save(le);
        return ResponseEntity.ok(Map.of("id", le.getId(), "ts", le.getTs()));
    }

    @GetMapping("/me")
    public List<LogEntry> my(@AuthenticationPrincipal User user, @RequestParam(defaultValue = "50") int limit) {
        int l = Math.max(1, Math.min(200, limit));
        return logs.findAllByUserOrderByTsDesc(user, PageRequest.of(0, l))
                .stream().filter(x -> x.getAction() == ActionType.WATCHED).toList();
    }
}

