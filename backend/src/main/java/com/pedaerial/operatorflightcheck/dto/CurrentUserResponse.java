package com.pedaerial.operatorflightcheck.dto;

public record CurrentUserResponse(
    String id,
    String email,
    String role
) {
}
