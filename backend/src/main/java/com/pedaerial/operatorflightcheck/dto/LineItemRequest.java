package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LineItemRequest {
    private String missionId;

    @NotBlank
    private String description;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal quantity;

    @NotNull
    @DecimalMin("0")
    private BigDecimal unitPrice;
}
