package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.PilotProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PilotProfileRepository extends JpaRepository<PilotProfile, UUID> {
    Optional<PilotProfile> findByPilotId(String pilotId);
}
