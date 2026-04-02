package com.pedaerial.operatorflightcheck.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "missions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mission {

    @Id
    @Column(nullable = false, updatable = false, length = 36)
    private String id;

    @NotBlank
    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "client_id", length = 36)
    private String clientId;

    @Column(name = "drone_profile_id", length = 36)
    private String droneProfileId;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 200)
    @Column(name = "location_label", length = 200)
    private String locationLabel;

    @Size(max = 500)
    @Column(name = "location_address", length = 500)
    private String locationAddress;

    @Column(name = "location_lat", precision = 10, scale = 6)
    private BigDecimal locationLat;

    @Column(name = "location_lon", precision = 10, scale = 6)
    private BigDecimal locationLon;

    @NotNull
    @Column(name = "mission_date", nullable = false)
    private LocalDate missionDate;

    @NotBlank
    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = MissionStatus.PLANNED.name();

    @Column(name = "fly_score")
    private Integer flyScore;

    @Column(name = "weather_summary", columnDefinition = "TEXT")
    private String weatherSummary;

    @Column(name = "duration_hours", precision = 4, scale = 2)
    private BigDecimal durationHours;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", insertable = false, updatable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drone_profile_id", insertable = false, updatable = false)
    private DroneProfile droneProfile;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "mission")
    private List<LineItem> lineItems = new ArrayList<>();

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "mission", cascade = jakarta.persistence.CascadeType.ALL)
    private List<Deliverable> deliverables = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (status == null || status.isBlank()) {
            status = MissionStatus.PLANNED.name();
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
