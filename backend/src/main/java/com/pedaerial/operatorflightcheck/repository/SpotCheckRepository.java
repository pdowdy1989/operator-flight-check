package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.SpotCheck;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SpotCheckRepository extends JpaRepository<SpotCheck, String> {

    List<SpotCheck> findBySpotId(String spotId);

    Optional<SpotCheck> findByIdAndUserId(String id, String userId);

    @Query("""
        select sc
        from SpotCheck sc
        where sc.user.id = :userId
        order by sc.date desc, sc.createdAt desc
        """)
    Page<SpotCheck> findPageByUserId(@Param("userId") String userId, Pageable pageable);
}
