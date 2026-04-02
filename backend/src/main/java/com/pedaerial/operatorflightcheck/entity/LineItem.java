package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "line_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LineItem {

    @Id
    @Column(nullable = false, updatable = false, length = 36)
    private String id;

    @NotBlank
    @Column(name = "invoice_id", nullable = false, length = 36)
    private String invoiceId;

    @Column(name = "mission_id", length = 36)
    private String missionId;

    @NotBlank
    @Column(nullable = false, length = 500)
    private String description;

    @NotNull
    @DecimalMin("0.01")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @NotNull
    @DecimalMin("0")
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false, insertable = false, updatable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id", insertable = false, updatable = false)
    private Mission mission;

    @PrePersist
    void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
        recalculateAmount();
    }

    @PreUpdate
    void preUpdate() {
        recalculateAmount();
    }

    private void recalculateAmount() {
        if (quantity != null && unitPrice != null) {
            amount = quantity.multiply(unitPrice);
        }
    }
}
