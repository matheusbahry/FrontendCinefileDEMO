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
    public WatchlistController(WatchlistRepository repo) { this.repo = repo; }

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
        return ResponseEntity.ok(it);
    }

    @DeleteMapping
    public ResponseEntity<?> remove(@AuthenticationPrincipal User user, @Valid @RequestBody WatchlistRequest req) {
        var existing = repo.findByUserAndMediaTypeAndTmdbId(user, req.getMediaType(), req.getTmdbId());
        existing.ifPresent(repo::delete);
        return ResponseEntity.ok(Map.of("removed", existing.isPresent()));
    }

    @PostMapping("/toggle")
    public Map<String,Object> toggle(@AuthenticationPrincipal User user, @Valid @RequestBody WatchlistRequest req) {
        var existing = repo.findByUserAndMediaTypeAndTmdbId(user, req.getMediaType(), req.getTmdbId());
        if (existing.isPresent()) { repo.delete(existing.get()); return Map.of("value", false); }
        var it = new WatchlistItem(); it.setUser(user); it.setMediaType(req.getMediaType()); it.setTmdbId(req.getTmdbId()); repo.save(it);
        return Map.of("value", true);
    }

    @GetMapping("/has/{type}/{tmdbId}")
    public Map<String,Object> has(@AuthenticationPrincipal User user, @PathVariable("type") String type, @PathVariable("tmdbId") Long tmdbId) {
        MediaType mt = "series".equalsIgnoreCase(type) ? MediaType.SERIES : MediaType.MOVIE;
        boolean exists = repo.findByUserAndMediaTypeAndTmdbId(user, mt, tmdbId).isPresent();
        return Map.of("value", exists);
    }
}

