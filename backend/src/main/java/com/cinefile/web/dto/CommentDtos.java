package com.cinefile.web.dto;

import com.cinefile.model.MediaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequest {
    @NotNull private MediaType mediaType;
    @NotNull private Long tmdbId;
    @NotBlank @Size(min=1, max=1000)
    private String text;
}

