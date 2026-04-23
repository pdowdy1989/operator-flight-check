package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthLoginRequest(
    @NotBlank(message = "Email is required.")
    @Email(message = "Enter a valid email address.")
    String email,

    @NotBlank(message = "Password is required.")
    String password
) {
    public AuthLoginRequest {
        if (email != null) {
            email = email.trim();
        }
    }
}
