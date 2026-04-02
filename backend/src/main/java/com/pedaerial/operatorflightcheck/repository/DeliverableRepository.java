package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.Deliverable;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliverableRepository extends JpaRepository<Deliverable, String> {

    List<Deliverable> findByMissionId(String missionId);
}
