package com.cinefile.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "ratings", indexes = {
        @Index(name="ix_rating_user_media", columnList = "user_id,mediaType,tmdbId", unique = true)
})
@Getter @Setter @NoArgsConstructor
public class Rating {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private MediaType mediaType;

    @Column(nullable = false)
    private Long tmdbId;

    @Column(nullable = false)
    private Integer stars; // 1..5

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
}

