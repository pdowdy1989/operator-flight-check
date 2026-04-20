package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "drone_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DroneProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id", nullable = false)
    private User pilot;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 100)
    @Column(length = 100)
    private String manufacturer;

    @Size(max = 100)
    @Column(length = 100)
    private String model;

    @Size(max = 100)
    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Size(max = 50)
    @Column(name = "faa_registration", length = 50)
    private String faaRegistration;

    @Column(name = "weight_grams")
    private Integer weightGrams;

    @Builder.Default
    @Column(name = "max_wind_mph")
    private Integer maxWindMph = 20;

    @Builder.Default
    @Column(name = "max_gust_mph")
    private Integer maxGustMph = 25;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
