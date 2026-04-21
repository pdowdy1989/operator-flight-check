package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "job_requests")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class JobRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_pilot_id")
    private User reviewedByPilot;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private JobRequestStatus status = JobRequestStatus.PENDING;

    @NotBlank
    @Size(max = 500)
    @Column(name = "site_address", nullable = false, length = 500)
    private String siteAddress;

    @Column(name = "site_lat", precision = 10, scale = 6)
    private BigDecimal siteLat;

    @Column(name = "site_lon", precision = 10, scale = 6)
    private BigDecimal siteLon;

    @Column(name = "requested_date")
    private LocalDate requestedDate;

    @Column(name = "requested_time")
    private LocalTime requestedTime;

    @Builder.Default
    @Column(name = "is_recurring", nullable = false)
    private Boolean isRecurring = false;

    @Size(max = 100)
    @Column(name = "recurrence_pattern")
    private String recurrencePattern;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @NotNull
    @Column(name = "rate_card_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal rateCardTotal;

    @NotNull
    @Builder.Default
    @Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @NotNull
    @Column(name = "final_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "proposed_budget", precision = 10, scale = 2)
    private BigDecimal proposedBudget;

    @Size(max = 100)
    @Column(name = "claim_number")
    private String claimNumber;

    @Size(max = 100)
    @Column(name = "policy_number")
    private String policyNumber;

    @Size(max = 255)
    @Column(name = "insurance_company_name")
    private String insuranceCompanyName;

    @Size(max = 255)
    @Column(name = "adjuster_name")
    private String adjusterName;

    @Email @Size(max = 255)
    @Column(name = "adjuster_email")
    private String adjusterEmail;

    @Size(max = 50)
    @Column(name = "adjuster_phone")
    private String adjusterPhone;

    @Column(name = "loss_date")
    private LocalDate lossDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "loss_type", length = 20)
    private LossType lossType;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", length = 20)
    private PropertyType propertyType;

    @Column(name = "inspection_scope", columnDefinition = "TEXT")
    private String inspectionScope;

    @OneToMany(mappedBy = "jobRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<JobRequestLineItem> lineItems = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_job_id")
    private Job createdJob;

    @Column(name = "decided_at")
    private Instant decidedAt;

    @Size(max = 1000)
    @Column(name = "decision_notes", columnDefinition = "TEXT")
    private String decisionNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
