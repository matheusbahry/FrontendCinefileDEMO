package com.cinefile.web.dto;

import com.cinefile.model.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CommentRequest {
    @NotNull private MediaType mediaType;
    @NotNull private Long tmdbId;
    @NotBlank @Size(min=1, max=1000)
    private String text;

    public MediaType getMediaType() { return mediaType; }
    public void setMediaType(MediaType mediaType) { this.mediaType = mediaType; }
    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}

