package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "inspection_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InspectionReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false, unique = true)
    private Job job;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id", nullable = false)
    private User pilot;

    @NotNull
    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "property_condition", nullable = false, length = 20)
    private PropertyCondition propertyCondition;

    @NotNull
    @Column(name = "damage_found", nullable = false)
    private Boolean damageFound;

    @Column(name = "damage_summary", columnDefinition = "TEXT")
    private String damageSummary;

    @Enumerated(EnumType.STRING)
    @Column(name = "roof_condition", length = 20)
    private ConditionRating roofCondition;

    @Enumerated(EnumType.STRING)
    @Column(name = "exterior_condition", length = 20)
    private ConditionRating exteriorCondition;

    @Column(name = "additional_findings", columnDefinition = "TEXT")
    private String additionalFindings;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Size(max = 255)
    @Column(name = "pilot_signature", length = 255)
    private String pilotSignature;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(length = 20)
    private ReportStatus status = ReportStatus.DRAFT;

    @Column(name = "reviewer_notes", columnDefinition = "TEXT")
    private String reviewerNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
