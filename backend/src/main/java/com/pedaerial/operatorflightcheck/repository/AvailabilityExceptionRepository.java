package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.AvailabilityException;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AvailabilityExceptionRepository extends JpaRepository<AvailabilityException, UUID> {
    List<AvailabilityException> findByPilotIdOrderByExceptionDateAsc(String pilotId);
    List<AvailabilityException> findByPilotIdAndExceptionDateBetweenOrderByExceptionDateAsc(
        String pilotId, LocalDate from, LocalDate to);
}
