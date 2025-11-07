package com.cinefile.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/tmdb")
public class TmdbController {
    private final RestClient http = RestClient.create();
    private final String apiKey;

    public TmdbController(@Value("${cinefile.tmdb.apiKey:}") String apiKey) {
        this.apiKey = apiKey;
    }

    @GetMapping("/credits/{type}/{id}")
    public ResponseEntity<?> credits(@PathVariable String type, @PathVariable Long id) {
        if (apiKey == null || apiKey.isBlank()) return ResponseEntity.status(501).body("TMDB API key not configured");
        String t = "series".equalsIgnoreCase(type) || "tv".equalsIgnoreCase(type) ? "tv" : "movie";
        String url = String.format("https://api.themoviedb.org/3/%s/%d/credits?api_key=%s", t, id, apiKey);
        var res = http.get().uri(url).retrieve().toEntity(String.class);
        return ResponseEntity.status(res.getStatusCode()).headers(res.getHeaders()).body(res.getBody());
    }

    @GetMapping("/details/{type}/{id}")
    public ResponseEntity<?> details(@PathVariable String type, @PathVariable Long id, @RequestParam(defaultValue = "pt-BR") String language) {
        if (apiKey == null || apiKey.isBlank()) return ResponseEntity.status(501).body("TMDB API key not configured");
        String t = "series".equalsIgnoreCase(type) || "tv".equalsIgnoreCase(type) ? "tv" : "movie";
        String url = String.format("https://api.themoviedb.org/3/%s/%d?api_key=%s&language=%s", t, id, apiKey, language);
        var res = http.get().uri(url).retrieve().toEntity(String.class);
        return ResponseEntity.status(res.getStatusCode()).headers(res.getHeaders()).body(res.getBody());
    }

    @GetMapping("/search/{type}")
    public ResponseEntity<?> search(@PathVariable String type, @RequestParam("q") String q, @RequestParam(value = "year", required = false) Integer year, @RequestParam(defaultValue = "pt-BR") String language) {
        if (apiKey == null || apiKey.isBlank()) return ResponseEntity.status(501).body("TMDB API key not configured");
        String t = "series".equalsIgnoreCase(type) || "tv".equalsIgnoreCase(type) ? "tv" : "movie";
        String base = String.format("https://api.themoviedb.org/3/search/%s?api_key=%s&language=%s&include_adult=false&query=%s", t, apiKey, language, java.net.URLEncoder.encode(q, java.nio.charset.StandardCharsets.UTF_8));
        if (year != null) {
            if ("movie".equals(t)) base += "&year=" + year; else base += "&first_air_date_year=" + year;
        }
        var res = http.get().uri(base).retrieve().toEntity(String.class);
        return ResponseEntity.status(res.getStatusCode()).headers(res.getHeaders()).body(res.getBody());
    }

    @GetMapping("/genres/{type}")
    public ResponseEntity<?> genres(@PathVariable String type, @RequestParam(defaultValue = "pt-BR") String language) {
        if (apiKey == null || apiKey.isBlank()) return ResponseEntity.status(501).body("TMDB API key not configured");
        String t = "series".equalsIgnoreCase(type) || "tv".equalsIgnoreCase(type) ? "tv" : "movie";
        String url = String.format("https://api.themoviedb.org/3/genre/%s/list?api_key=%s&language=%s", t, apiKey, language);
        var res = http.get().uri(url).retrieve().toEntity(String.class);
        return ResponseEntity.status(res.getStatusCode()).headers(res.getHeaders()).body(res.getBody());
    }

    @GetMapping("/discover/{type}")
    public ResponseEntity<?> discover(@PathVariable String type,
                                      @RequestParam(value = "with_genres", required = false) String withGenres,
                                      @RequestParam(value = "page", defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "pt-BR") String language) {
        if (apiKey == null || apiKey.isBlank()) return ResponseEntity.status(501).body("TMDB API key not configured");
        String t = "series".equalsIgnoreCase(type) || "tv".equalsIgnoreCase(type) ? "tv" : "movie";
        String base = String.format("https://api.themoviedb.org/3/discover/%s?api_key=%s&language=%s&include_adult=false&page=%d", t, apiKey, language, Math.max(1, Math.min(500, page)));
        if (withGenres != null && !withGenres.isBlank()) base += "&with_genres=" + java.net.URLEncoder.encode(withGenres, java.nio.charset.StandardCharsets.UTF_8);
        var res = http.get().uri(base).retrieve().toEntity(String.class);
        return ResponseEntity.status(res.getStatusCode()).headers(res.getHeaders()).body(res.getBody());
    }
}
