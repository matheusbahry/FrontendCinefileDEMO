package com.cinefile.repo;

import com.cinefile.model.MediaType;
import com.cinefile.model.User;
import com.cinefile.model.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<WatchlistItem, Long> {
    Optional<WatchlistItem> findByUserAndMediaTypeAndTmdbId(User user, MediaType mediaType, Long tmdbId);
    List<WatchlistItem> findAllByUserOrderByCreatedAtDesc(User user);
}

