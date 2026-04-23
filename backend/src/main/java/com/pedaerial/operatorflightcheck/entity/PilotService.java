package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pilot_services")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PilotService {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id", nullable = false, columnDefinition = "CHAR(36)")
    private User pilot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_service_id", columnDefinition = "CHAR(36)")
    private ServiceCatalog catalogService;

    @Size(max = 200)
    @Column(name = "custom_name", length = 200)
    private String customName;

    @Size(max = 1000)
    @Column(name = "custom_description", columnDefinition = "TEXT")
    private String customDescription;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false, length = 30)
    private JobType jobType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "pricing_type", nullable = false, length = 10)
    private PricingType pricingType;

    @Column(name = "flat_fee", precision = 10, scale = 2)
    private BigDecimal flatFee;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    /** Resolves the display name: custom name if present, otherwise catalog name. */
    @Transient
    public String getDisplayName() {
        if (customName != null && !customName.isBlank()) {
            return customName;
        }
        return catalogService != null ? catalogService.getName() : "Custom Service";
    }

    /** Returns the primary unit price based on pricing type. */
    @Transient
    public BigDecimal getEffectiveUnitPrice() {
        return switch (pricingType) {
            case FLAT, BOTH -> flatFee;
            case HOURLY -> hourlyRate;
        };
    }
}
