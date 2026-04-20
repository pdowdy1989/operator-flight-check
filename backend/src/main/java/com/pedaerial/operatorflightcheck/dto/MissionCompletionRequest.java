package com.pedaerial.operatorflightcheck.dto;

public record MissionCompletionRequest(
    Integer durationMinutes,
    Double weatherTempF,
    Double weatherWindMph,
    Double weatherGustMph,
    String weatherConditions,
    String weatherVisibility,
    Integer flyScore,
    String notes
) {}
