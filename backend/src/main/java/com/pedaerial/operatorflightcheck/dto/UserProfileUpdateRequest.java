package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.PaymentTerms;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateRequest {

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Size(max = 50)
    private String phone;

    @Size(max = 255)
    private String company;

    @Size(max = 50)
    private String licenseNumber;

    @Size(max = 255)
    private String businessName;

    @Size(max = 50)
    private String ein;

    private Boolean llcVerified;
    private PaymentTerms paymentTerms;

    @Size(max = 500)
    private String billingAddress;

    @Size(max = 100)
    private String billingCity;

    @Size(max = 50)
    private String billingState;

    @Size(max = 20)
    private String billingZip;

    @Size(max = 100)
    private String insurancePolicyNumber;

    @Size(max = 255)
    private String insuranceCompanyName;
}
