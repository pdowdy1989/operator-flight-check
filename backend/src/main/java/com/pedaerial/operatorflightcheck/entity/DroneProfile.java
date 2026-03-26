package com.pedaerial.operatorflightcheck.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "drone_profiles")
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

    @PrePersist
    void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getWindGreenMph() {
        return windGreenMph;
    }

    public void setWindGreenMph(Integer windGreenMph) {
        this.windGreenMph = windGreenMph;
    }

    public Integer getWindYellowMph() {
        return windYellowMph;
    }

    public void setWindYellowMph(Integer windYellowMph) {
        this.windYellowMph = windYellowMph;
    }

    public Integer getGustGreenMph() {
        return gustGreenMph;
    }

    public void setGustGreenMph(Integer gustGreenMph) {
        this.gustGreenMph = gustGreenMph;
    }

    public Integer getGustYellowMph() {
        return gustYellowMph;
    }

    public void setGustYellowMph(Integer gustYellowMph) {
        this.gustYellowMph = gustYellowMph;
    }

    public Integer getPrecipGreenPct() {
        return precipGreenPct;
    }

    public void setPrecipGreenPct(Integer precipGreenPct) {
        this.precipGreenPct = precipGreenPct;
    }

    public Integer getPrecipYellowPct() {
        return precipYellowPct;
    }

    public void setPrecipYellowPct(Integer precipYellowPct) {
        this.precipYellowPct = precipYellowPct;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
