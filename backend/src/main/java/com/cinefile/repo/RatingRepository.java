package com.cinefile.repo;

import com.cinefile.model.MediaType;
import com.cinefile.model.Rating;
import com.cinefile.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByUserAndMediaTypeAndTmdbId(User user, MediaType mediaType, Long tmdbId);
    List<Rating> findAllByUser(User user);

    @Query("select avg(r.stars) as avg, count(r) as cnt from Rating r where r.mediaType = ?1 and r.tmdbId = ?2")
    Object[] aggByMedia(MediaType mediaType, Long tmdbId);
}

