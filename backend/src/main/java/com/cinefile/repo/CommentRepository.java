package com.cinefile.repo;

import com.cinefile.model.Comment;
import com.cinefile.model.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findAllByMediaTypeAndTmdbIdOrderByCreatedAtDesc(MediaType mediaType, Long tmdbId);
}

