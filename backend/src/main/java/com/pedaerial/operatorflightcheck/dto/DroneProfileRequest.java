package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DroneProfileRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 50)
    private String type;

    @Min(0)
    @Max(999)
    private Integer windGreenMph;

    @Min(0)
    @Max(999)
    private Integer windYellowMph;

    @Min(0)
    @Max(999)
    private Integer gustGreenMph;

    @Min(0)
    @Max(999)
    private Integer gustYellowMph;

    @Min(0)
    @Max(100)
    private Integer precipGreenPct;

    @Min(0)
    @Max(100)
    private Integer precipYellowPct;

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
}
