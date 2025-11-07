package com.cinefile.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "season_ratings", indexes = {
        @Index(name="ix_season_rating_unique", columnList = "user_id,tmdbId,seasonNumber", unique = true)
})
@Getter @Setter @NoArgsConstructor
public class SeasonRating {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @Column(nullable = false)
    private Long tmdbId;

    @Column(nullable = false)
    private Integer seasonNumber;

    @Column(nullable = false)
    private Integer stars; // 1..5

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
}

