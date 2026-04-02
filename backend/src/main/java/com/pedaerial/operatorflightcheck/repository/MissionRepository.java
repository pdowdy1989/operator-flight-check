package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.Mission;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MissionRepository extends JpaRepository<Mission, String> {

    Page<Mission> findByUserIdOrderByMissionDateDesc(String userId, Pageable pageable);

    Optional<Mission> findByIdAndUserId(String id, String userId);

    List<Mission> findByUserIdAndClientId(String userId, String clientId);

    List<Mission> findByUserIdAndStatus(String userId, String status);

    @Query("SELECT m FROM Mission m WHERE m.userId = :userId AND m.missionDate BETWEEN :start AND :end")
    List<Mission> findByUserIdAndDateRange(@Param("userId") String userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    long countByUserId(String userId);

    long countByUserIdAndStatus(String userId, String status);

    List<Mission> findTop5ByUserIdAndStatusAndMissionDateGreaterThanEqualOrderByMissionDateAsc(String userId, String status, LocalDate missionDate);
}
