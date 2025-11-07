package com.cinefile.web.dto;

import com.cinefile.model.MediaType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WatchlistRequest {
    @NotNull private MediaType mediaType;
    @NotNull private Long tmdbId;
}

