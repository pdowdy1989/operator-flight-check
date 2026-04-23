package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pilot_profiles")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PilotProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id", nullable = false, unique = true, columnDefinition = "CHAR(36)")
    private User pilot;

    @Size(max = 2000)
    @Column(columnDefinition = "TEXT")
    private String bio;

    @Size(max = 500)
    @Column(name = "profile_photo_path", length = 500)
    private String profilePhotoPath;

    @Min(0) @Max(60)
    @Column(name = "years_experience")
    private Integer yearsExperience;

    @Size(max = 2000)
    @Column(columnDefinition = "TEXT")
    private String certifications;

    @Builder.Default
    @Column(name = "accepting_jobs", nullable = false)
    private Boolean acceptingJobs = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
