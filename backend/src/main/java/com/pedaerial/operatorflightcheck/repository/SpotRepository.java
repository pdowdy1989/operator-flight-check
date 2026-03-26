package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.Spot;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpotRepository extends JpaRepository<Spot, String> {

    List<Spot> findByUserId(String userId);

    Optional<Spot> findByIdAndUserId(String id, String userId);
}
