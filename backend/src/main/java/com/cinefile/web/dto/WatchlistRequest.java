package com.cinefile.web.dto;

import com.cinefile.model.MediaType;
import jakarta.validation.constraints.NotNull;

public class WatchlistRequest {
    @NotNull private MediaType mediaType;
    @NotNull private Long tmdbId;

    public MediaType getMediaType() { return mediaType; }
    public void setMediaType(MediaType mediaType) { this.mediaType = mediaType; }
    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }
}

