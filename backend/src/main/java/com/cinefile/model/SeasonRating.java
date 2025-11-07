package com.cinefile.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "season_ratings", indexes = {
        @Index(name="ix_season_rating_unique", columnList = "user_id,tmdbId,seasonNumber", unique = true)
})
public class SeasonRating {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private Long tmdbId;

    @Column(nullable = false)
    private Integer seasonNumber;

    @Column(nullable = false)
    private Integer stars; // 1..5

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public SeasonRating() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }
    public Integer getSeasonNumber() { return seasonNumber; }
    public void setSeasonNumber(Integer seasonNumber) { this.seasonNumber = seasonNumber; }
    public Integer getStars() { return stars; }
    public void setStars(Integer stars) { this.stars = stars; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
