package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MissionRepository extends JpaRepository<Mission, UUID> {
    List<Mission> findByJobIdOrderByFlightDateDesc(UUID jobId);
    List<Mission> findByPilotIdAndFlightDate(String pilotId, LocalDate flightDate);
}
