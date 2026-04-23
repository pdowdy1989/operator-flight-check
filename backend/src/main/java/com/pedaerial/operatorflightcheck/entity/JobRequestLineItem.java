package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "job_request_line_items")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class JobRequestLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_request_id", nullable = false)
    private JobRequest jobRequest;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_service_id", nullable = false)
    private PilotService pilotService;

    @NotBlank
    @Size(max = 100)
    @Column(name = "service_name_snapshot", nullable = false)
    private String serviceNameSnapshot;

    @NotNull
    @Column(name = "unit_price_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceSnapshot;

    @NotBlank
    @Size(max = 10)
    @Builder.Default
    @Column(name = "pricing_type_snapshot", nullable = false, length = 10)
    private String pricingTypeSnapshot = "FLAT";

    @NotNull
    @Builder.Default
    @Column(nullable = false)
    private Integer quantity = 1;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Builder.Default
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
