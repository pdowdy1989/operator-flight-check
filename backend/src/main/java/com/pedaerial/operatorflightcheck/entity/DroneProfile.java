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
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
@Table(name = "drone_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class DroneProfile {

    @Id
    @Column(nullable = false, updatable = false, length = 36)
    private String id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String type;

    @Min(0)
    @Max(999)
    @Column(name = "wind_green_mph")
    private Integer windGreenMph;

    @Min(0)
    @Max(999)
    @Column(name = "wind_yellow_mph")
    private Integer windYellowMph;

    @Min(0)
    @Max(999)
    @Column(name = "gust_green_mph")
    private Integer gustGreenMph;

    @Min(0)
    @Max(999)
    @Column(name = "gust_yellow_mph")
    private Integer gustYellowMph;

    @Min(0)
    @Max(100)
    @Column(name = "precip_green_pct")
    private Integer precipGreenPct;

    @Min(0)
    @Max(100)
    @Column(name = "precip_yellow_pct")
    private Integer precipYellowPct;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<SpotCheck> spotChecks = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
