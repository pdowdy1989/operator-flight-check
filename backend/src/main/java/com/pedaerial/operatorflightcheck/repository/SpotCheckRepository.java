package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.SpotCheck;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpotCheckRepository extends JpaRepository<SpotCheck, String> {

    List<SpotCheck> findBySpotId(String spotId);
}
