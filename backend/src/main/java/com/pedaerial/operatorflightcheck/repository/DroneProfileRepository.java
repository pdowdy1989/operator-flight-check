package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.DroneProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DroneProfileRepository extends JpaRepository<DroneProfile, String> {

    List<DroneProfile> findByUserId(String userId);

    Optional<DroneProfile> findByIdAndUserId(String id, String userId);
}
