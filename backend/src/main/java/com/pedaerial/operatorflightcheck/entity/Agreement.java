package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "agreements")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Agreement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false, unique = true)
    private Job job;

    @NotBlank
    @Size(max = 50)
    @Column(name = "agreement_number", nullable = false, unique = true, length = 50)
    private String agreementNumber;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private AgreementStatus status = AgreementStatus.PENDING_SIGNATURE;

    @Column(name = "signed_at")
    private Instant signedAt;

    @Size(max = 255)
    @Column(name = "signed_by_name")
    private String signedByName;

    @Size(max = 255)
    @Column(name = "signed_by_email")
    private String signedByEmail;

    @Size(max = 500)
    @Column(name = "pdf_path")
    private String pdfPath;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
