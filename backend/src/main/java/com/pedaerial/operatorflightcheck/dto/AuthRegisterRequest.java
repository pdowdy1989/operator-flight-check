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
    String password,

    String role,
    String firstName,
    String lastName,
    String phone,
    String company,
    String licenseNumber
) {
    public AuthRegisterRequest {
        if (email != null) email = email.trim();
        if (role != null) role = role.trim();
        if (firstName != null) firstName = firstName.trim();
        if (lastName != null) lastName = lastName.trim();
        if (phone != null) phone = phone.trim();
        if (company != null) company = company.trim();
        if (licenseNumber != null) licenseNumber = licenseNumber.trim();
    }
}
