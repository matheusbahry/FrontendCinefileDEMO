package com.cinefile.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "watchlist", indexes = {
        @Index(name="ix_watchlist_user_media", columnList = "user_id,mediaType,tmdbId", unique = true)
})
@Getter @Setter @NoArgsConstructor
public class WatchlistItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JsonIgnore
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private MediaType mediaType;

    @Column(nullable = false)
    private Long tmdbId;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
