package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRequestLineItemSubmitRequest {

    @NotNull
    private UUID serviceCatalogId;

    @NotNull
    @Min(1)
    private Integer quantity;
}
