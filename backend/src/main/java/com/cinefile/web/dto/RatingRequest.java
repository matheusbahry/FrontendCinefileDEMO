package com.cinefile.web.dto;

import com.cinefile.model.MediaType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class RatingRequest {
    @NotNull private MediaType mediaType; // MOVIE | SERIES
    @NotNull private Long tmdbId;
    @Min(1) @Max(5) private int stars;

    public MediaType getMediaType() { return mediaType; }
    public void setMediaType(MediaType mediaType) { this.mediaType = mediaType; }
    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }
    public int getStars() { return stars; }
    public void setStars(int stars) { this.stars = stars; }
}

