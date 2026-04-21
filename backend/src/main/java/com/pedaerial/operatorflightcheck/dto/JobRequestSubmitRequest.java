package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.LossType;
import com.pedaerial.operatorflightcheck.entity.PropertyType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRequestSubmitRequest {

    @NotNull
    @Size(min = 1)
    private List<JobRequestLineItemSubmitRequest> lineItems;

    @NotBlank
    @Size(max = 500)
    private String siteAddress;

    private BigDecimal siteLat;
    private BigDecimal siteLon;
    private LocalDate requestedDate;
    private LocalTime requestedTime;
    private Boolean isRecurring;

    @Size(max = 100)
    private String recurrencePattern;

    private String notes;
    private BigDecimal proposedBudget;

    @Size(max = 100)
    private String claimNumber;

    @Size(max = 100)
    private String policyNumber;

    @Size(max = 255)
    private String insuranceCompanyName;

    @Size(max = 255)
    private String adjusterName;

    @Email
    @Size(max = 255)
    private String adjusterEmail;

    @Size(max = 50)
    private String adjusterPhone;

    private LocalDate lossDate;
    private LossType lossType;
    private PropertyType propertyType;
    private String inspectionScope;
}
