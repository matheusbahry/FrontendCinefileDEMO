package com.cinefile.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "logs", indexes = {
        @Index(name="ix_logs_user", columnList = "user_id,ts"),
        @Index(name="ix_logs_media", columnList = "mediaType,tmdbId")
})
@Getter @Setter @NoArgsConstructor
public class LogEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JsonIgnore
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ActionType action;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private MediaType mediaType;

    @Column(nullable = false)
    private Long tmdbId;

    @Column(nullable = false)
    private Instant ts = Instant.now();

    @Column(length = 500)
    private String details;
}

