package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRegisterRequest(
    @NotBlank(message = "Email is required.")
    @Email(message = "Enter a valid email address.")
    String email,

    @NotBlank(message = "Password is required.")
    @Size(min = 8, message = "Password must be at least 8 characters.")
    String password
) {
    public AuthRegisterRequest {
        if (email != null) {
            email = email.trim();
        }
        if (password != null) {
            password = password.trim();
        }
    }
}
