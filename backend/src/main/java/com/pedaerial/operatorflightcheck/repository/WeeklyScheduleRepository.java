package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.WeeklySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface WeeklyScheduleRepository extends JpaRepository<WeeklySchedule, UUID> {
    List<WeeklySchedule> findByPilotIdOrderByDayOfWeekAsc(String pilotId);

    @Modifying
    @Query("DELETE FROM WeeklySchedule w WHERE w.pilot.id = :pilotId")
    void deleteAllByPilotId(@Param("pilotId") String pilotId);
}
