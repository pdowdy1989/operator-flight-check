package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.PilotService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PilotServiceRepository extends JpaRepository<PilotService, UUID> {
    List<PilotService> findByPilotIdAndActiveTrueOrderBySortOrderAsc(String pilotId);
    List<PilotService> findByPilotIdOrderBySortOrderAsc(String pilotId);
}
