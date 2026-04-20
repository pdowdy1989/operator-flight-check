package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.LossType;
import com.pedaerial.operatorflightcheck.entity.PropertyType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record InsuranceDetailsRequest(
    @NotBlank(message = "Claim number is required.")
    @Size(max = 100)
    String claimNumber,

    @Size(max = 100)
    String policyNumber,

    @NotBlank(message = "Insurance company is required.")
    @Size(max = 255)
    String insuranceCompany,

    @Size(max = 255)
    String adjusterName,

    @Email
    @Size(max = 255)
    String adjusterEmail,

    @Size(max = 50)
    String adjusterPhone,

    LocalDate lossDate,
    LossType lossType,
    PropertyType propertyType,
    String inspectionScope
) {}
