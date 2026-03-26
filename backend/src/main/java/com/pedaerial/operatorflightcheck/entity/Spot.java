package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "spots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Spot {

    @Id
    @Column(nullable = false, updatable = false, length = 36)
    private String id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 200)
    @Column(length = 200)
    private String label;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String address;

    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    @Column(precision = 10, scale = 6)
    private BigDecimal lat;

    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    @Column(precision = 10, scale = 6)
    private BigDecimal lon;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean favorite = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Mirror the database cascade at the JPA layer so deleting a spot also clears its checks in ORM workflows.
    @Builder.Default
    @OneToMany(mappedBy = "spot", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SpotCheck> spotChecks = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (favorite == null) {
            favorite = false;
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
