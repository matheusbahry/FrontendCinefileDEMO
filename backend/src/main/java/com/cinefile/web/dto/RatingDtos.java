package com.cinefile.web.dto;

import com.cinefile.model.MediaType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RatingRequest {
    @NotNull private MediaType mediaType; // MOVIE | SERIES
    @NotNull private Long tmdbId;
    @Min(1) @Max(5) private int stars;
}

@Data
class SeasonRatingRequest {
    @NotNull private Long tmdbId;
    @NotNull private Integer seasonNumber;
    @Min(1) @Max(5) private int stars;
}

