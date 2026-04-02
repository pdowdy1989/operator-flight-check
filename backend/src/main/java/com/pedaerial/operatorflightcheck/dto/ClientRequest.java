package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientRequest {

    @NotBlank
    private String name;

    @Email
    private String email;

    private String company;
    private String phone;
    private String billingAddress;
    private String notes;
}
