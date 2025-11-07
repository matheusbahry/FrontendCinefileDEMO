package com.cinefile.repo;

import com.cinefile.model.LogEntry;
import com.cinefile.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogRepository extends JpaRepository<LogEntry, Long> {
    List<LogEntry> findAllByUserOrderByTsDesc(User user, Pageable pageable);
}

