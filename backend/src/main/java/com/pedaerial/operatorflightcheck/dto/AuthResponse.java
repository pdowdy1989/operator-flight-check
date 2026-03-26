package com.pedaerial.operatorflightcheck.dto;

public record AuthResponse(
    String id,
    String email,
    String role,
    String token
) {
}
