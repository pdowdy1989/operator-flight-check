package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.PaymentTerms;
import com.pedaerial.operatorflightcheck.entity.Role;

import java.time.Instant;

public record UserProfileResponse(
    String id,
    String email,
    Role role,
    String firstName,
    String lastName,
    String phone,
    String company,
    String licenseNumber,
    String businessName,
    String ein,
    Boolean llcVerified,
    PaymentTerms paymentTerms,
    String billingAddress,
    String billingCity,
    String billingState,
    String billingZip,
    String insurancePolicyNumber,
    String insuranceCompanyName,
    Instant createdAt
) {}
