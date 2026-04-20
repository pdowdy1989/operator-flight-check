package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.ClientType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClientRequest(
    @NotBlank(message = "Client name is required.")
    @Size(max = 255)
    String name,

    @Email
    @Size(max = 255)
    String email,

    @Size(max = 50)
    String phone,

    @Size(max = 255)
    String company,

    @NotNull(message = "Client type is required.")
    ClientType clientType,

    @Size(max = 500)
    String address,

    String notes
) {}
