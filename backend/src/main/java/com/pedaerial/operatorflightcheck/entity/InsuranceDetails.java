package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "insurance_details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false, unique = true)
    private Job job;

    @NotBlank
    @Size(max = 100)
    @Column(name = "claim_number", nullable = false, length = 100)
    private String claimNumber;

    @Size(max = 100)
    @Column(name = "policy_number", length = 100)
    private String policyNumber;

    @NotBlank
    @Size(max = 255)
    @Column(name = "insurance_company", nullable = false, length = 255)
    private String insuranceCompany;

    @Size(max = 255)
    @Column(name = "adjuster_name", length = 255)
    private String adjusterName;

    @Email
    @Size(max = 255)
    @Column(name = "adjuster_email", length = 255)
    private String adjusterEmail;

    @Size(max = 50)
    @Column(name = "adjuster_phone", length = 50)
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

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
