package com.pedaerial.operatorflightcheck.dto;

import com.pedaerial.operatorflightcheck.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceCatalogRequest {

    @NotNull
    private JobType jobType;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 1000)
    private String description;

    @NotNull
    private BigDecimal basePrice;

    private Integer estimatedDurationMinutes;
    private Boolean active;
    private Integer sortOrder;
}
