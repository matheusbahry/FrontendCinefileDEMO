package com.cinefile.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "logs", indexes = {
        @Index(name="ix_logs_user", columnList = "user_id,ts"),
        @Index(name="ix_logs_media", columnList = "mediaType,tmdbId")
})
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

    public LogEntry() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public ActionType getAction() { return action; }
    public void setAction(ActionType action) { this.action = action; }
    public MediaType getMediaType() { return mediaType; }
    public void setMediaType(MediaType mediaType) { this.mediaType = mediaType; }
    public Long getTmdbId() { return tmdbId; }
    public void setTmdbId(Long tmdbId) { this.tmdbId = tmdbId; }
    public Instant getTs() { return ts; }
    public void setTs(Instant ts) { this.ts = ts; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
