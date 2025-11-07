package com.cinefile.repo;

import com.cinefile.model.SeasonRating;
import com.cinefile.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SeasonRatingRepository extends JpaRepository<SeasonRating, Long> {
    Optional<SeasonRating> findByUserAndTmdbIdAndSeasonNumber(User user, Long tmdbId, Integer seasonNumber);
    List<SeasonRating> findAllByUser(User user);
}

