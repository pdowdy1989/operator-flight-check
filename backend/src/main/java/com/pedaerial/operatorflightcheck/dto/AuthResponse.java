package com.pedaerial.operatorflightcheck.dto;

public record AuthResponse(
    String id,
    String email,
    String role,
    String firstName,
    String lastName,
    String company,
    String token
) {
}
