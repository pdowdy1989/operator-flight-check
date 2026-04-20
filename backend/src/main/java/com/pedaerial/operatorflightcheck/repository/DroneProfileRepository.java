package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DroneProfileRepository extends JpaRepository<DroneProfile, UUID> {
    List<DroneProfile> findByPilotIdOrderByNameAsc(String pilotId);
    List<DroneProfile> findByPilotIdAndActiveTrue(String pilotId);
}
