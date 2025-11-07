package com.cinefile.web;

import com.cinefile.model.MediaType;
import com.cinefile.model.Rating;
import com.cinefile.model.SeasonRating;
import com.cinefile.model.User;
import com.cinefile.repo.RatingRepository;
import com.cinefile.repo.SeasonRatingRepository;
import com.cinefile.web.dto.RatingRequest;
import com.cinefile.web.dto.SeasonRatingRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {
    private final RatingRepository ratingRepo;
    private final SeasonRatingRepository seasonRepo;
    private final com.cinefile.repo.LogRepository logs;

    public RatingController(RatingRepository ratingRepo, SeasonRatingRepository seasonRepo, com.cinefile.repo.LogRepository logs) {
        this.ratingRepo = ratingRepo; this.seasonRepo = seasonRepo; this.logs = logs;
    }

    @PostMapping
    public ResponseEntity<?> rate(@AuthenticationPrincipal User user, @Valid @RequestBody RatingRequest req) {
        if (user == null) return ResponseEntity.status(401).build();
        Rating r = ratingRepo.findByUserAndMediaTypeAndTmdbId(user, req.getMediaType(), req.getTmdbId())
                .orElseGet(() -> { Rating x = new Rating(); x.setUser(user); x.setMediaType(req.getMediaType()); x.setTmdbId(req.getTmdbId()); return x; });
        r.setStars(Math.max(1, Math.min(5, req.getStars())));
        r.setUpdatedAt(Instant.now());
        ratingRepo.save(r);
        var le = new com.cinefile.model.LogEntry();
        le.setUser(user); le.setAction(com.cinefile.model.ActionType.RATING_SET); le.setMediaType(req.getMediaType()); le.setTmdbId(req.getTmdbId());
        le.setTs(Instant.now()); le.setDetails("stars=" + r.getStars());
        logs.save(le);
        return ResponseEntity.ok(Map.of("id", r.getId(), "stars", r.getStars(), "tmdbId", r.getTmdbId(), "mediaType", r.getMediaType()));
    }

    @GetMapping("/me")
    public List<Rating> myRatings(@AuthenticationPrincipal User user) {
        return ratingRepo.findAllByUser(user);
    }

    @GetMapping("/summary/{type}/{tmdbId}")
    public Map<String,Object> summary(@PathVariable("type") String type, @PathVariable("tmdbId") Long tmdbId) {
        MediaType mt = "series".equalsIgnoreCase(type) ? MediaType.SERIES : MediaType.MOVIE;
        Object[] row = ratingRepo.aggByMedia(mt, tmdbId);
        double avg = 0; long cnt = 0;
        if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
            avg = ((Number)row[0]).doubleValue();
            cnt = ((Number)row[1]).longValue();
        }
        return Map.of("avg", avg, "count", cnt);
    }

    @PostMapping("/season")
    public ResponseEntity<?> rateSeason(@AuthenticationPrincipal User user, @Valid @RequestBody SeasonRatingRequest req) {
        if (user == null) return ResponseEntity.status(401).build();
        SeasonRating r = seasonRepo.findByUserAndTmdbIdAndSeasonNumber(user, req.getTmdbId(), req.getSeasonNumber())
                .orElseGet(() -> { SeasonRating x = new SeasonRating(); x.setUser(user); x.setTmdbId(req.getTmdbId()); x.setSeasonNumber(req.getSeasonNumber()); return x; });
        r.setStars(Math.max(1, Math.min(5, req.getStars())));
        r.setUpdatedAt(Instant.now());
        seasonRepo.save(r);
        var le = new com.cinefile.model.LogEntry();
        le.setUser(user); le.setAction(com.cinefile.model.ActionType.RATING_SET); le.setMediaType(com.cinefile.model.MediaType.SERIES); le.setTmdbId(req.getTmdbId());
        le.setTs(Instant.now()); le.setDetails("season="+req.getSeasonNumber()+",stars="+r.getStars());
        logs.save(le);
        return ResponseEntity.ok(Map.of("id", r.getId(), "stars", r.getStars()));
    }
}
