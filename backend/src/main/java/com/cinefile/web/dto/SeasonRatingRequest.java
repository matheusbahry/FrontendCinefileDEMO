package com.cinefile.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class SeasonRatingRequest {
    @NotNull private Long tmdbId;
    @NotNull private Integer seasonNumber;
    @Min(1) @Max(5) private int stars;

    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }
    public Integer getSeasonNumber() { return seasonNumber; }
    public void setSeasonNumber(Integer seasonNumber) { this.seasonNumber = seasonNumber; }
    public int getStars() { return stars; }
    public void setStars(int stars) { this.stars = stars; }
}

