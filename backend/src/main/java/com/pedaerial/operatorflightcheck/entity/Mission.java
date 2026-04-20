package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "missions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id", nullable = false)
    private User pilot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drone_profile_id")
    private DroneProfile droneProfile;

    @NotNull
    @Column(name = "flight_date", nullable = false)
    private LocalDate flightDate;

    @Column(name = "flight_time")
    private LocalTime flightTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "weather_temp_f")
    private Double weatherTempF;

    @Column(name = "weather_wind_mph")
    private Double weatherWindMph;

    @Column(name = "weather_gust_mph")
    private Double weatherGustMph;

    @Column(name = "weather_conditions", length = 100)
    private String weatherConditions;

    @Column(name = "weather_visibility", length = 50)
    private String weatherVisibility;

    @Column(name = "fly_score")
    private Integer flyScore;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(length = 20)
    private MissionStatus status = MissionStatus.PLANNED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
