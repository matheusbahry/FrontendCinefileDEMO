package com.cinefile.web;

import com.cinefile.model.MediaType;
import com.cinefile.model.User;
import com.cinefile.model.WatchlistItem;
import com.cinefile.repo.WatchlistRepository;
import com.cinefile.web.dto.WatchlistRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {
    private final WatchlistRepository repo;
    private final com.cinefile.repo.LogRepository logs;
    public WatchlistController(WatchlistRepository repo, com.cinefile.repo.LogRepository logs) { this.repo = repo; this.logs = logs; }

    @GetMapping
    public List<WatchlistItem> list(@AuthenticationPrincipal User user) {
        return repo.findAllByUserOrderByCreatedAtDesc(user);
    }

    @PostMapping
    public ResponseEntity<?> add(@AuthenticationPrincipal User user, @Valid @RequestBody WatchlistRequest req) {
        var existing = repo.findByUserAndMediaTypeAndTmdbId(user, req.getMediaType(), req.getTmdbId());
        if (existing.isPresent()) return ResponseEntity.ok(existing.get());
        var it = new WatchlistItem();
        it.setUser(user); it.setMediaType(req.getMediaType()); it.setTmdbId(req.getTmdbId());
        repo.save(it);
        var le = new com.cinefile.model.LogEntry();
        le.setUser(user); le.setAction(com.cinefile.model.ActionType.WATCHLIST_ADD); le.setMediaType(req.getMediaType()); le.setTmdbId(req.getTmdbId());
        logs.save(le);
        return ResponseEntity.ok(it);
    }

    @DeleteMapping
    public ResponseEntity<?> remove(@AuthenticationPrincipal User user, @Valid @RequestBody WatchlistRequest req) {
        var existing = repo.findByUserAndMediaTypeAndTmdbId(user, req.getMediaType(), req.getTmdbId());
        existing.ifPresent(x -> { repo.delete(x); });
        if (existing.isPresent()) {
            var le = new com.cinefile.model.LogEntry();
            le.setUser(user); le.setAction(com.cinefile.model.ActionType.WATCHLIST_REMOVE); le.setMediaType(req.getMediaType()); le.setTmdbId(req.getTmdbId());
            logs.save(le);
        }
        return ResponseEntity.ok(Map.of("removed", existing.isPresent()));
    }

    @PostMapping("/toggle")
    public Map<String,Object> toggle(@AuthenticationPrincipal User user, @Valid @RequestBody WatchlistRequest req) {
        var existing = repo.findByUserAndMediaTypeAndTmdbId(user, req.getMediaType(), req.getTmdbId());
        if (existing.isPresent()) { repo.delete(existing.get());
            var le = new com.cinefile.model.LogEntry();
            le.setUser(user); le.setAction(com.cinefile.model.ActionType.WATCHLIST_REMOVE); le.setMediaType(req.getMediaType()); le.setTmdbId(req.getTmdbId());
            logs.save(le);
            return Map.of("value", false);
        }
        var it = new WatchlistItem(); it.setUser(user); it.setMediaType(req.getMediaType()); it.setTmdbId(req.getTmdbId()); repo.save(it);
        var le = new com.cinefile.model.LogEntry();
        le.setUser(user); le.setAction(com.cinefile.model.ActionType.WATCHLIST_ADD); le.setMediaType(req.getMediaType()); le.setTmdbId(req.getTmdbId());
        logs.save(le);
        return Map.of("value", true);
    }

    @GetMapping("/has/{type}/{tmdbId}")
    public Map<String,Object> has(@AuthenticationPrincipal User user, @PathVariable("type") String type, @PathVariable("tmdbId") Long tmdbId) {
        MediaType mt = "series".equalsIgnoreCase(type) ? MediaType.SERIES : MediaType.MOVIE;
        boolean exists = repo.findByUserAndMediaTypeAndTmdbId(user, mt, tmdbId).isPresent();
        return Map.of("value", exists);
    }
}
