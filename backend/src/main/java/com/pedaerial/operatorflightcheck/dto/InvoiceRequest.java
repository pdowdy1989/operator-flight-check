package com.pedaerial.operatorflightcheck.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {
    @NotBlank
    private String clientId;

    @NotNull
    private LocalDate issueDate;

    @NotNull
    private LocalDate dueDate;

    private String notes;

    @Valid
    @NotEmpty
    private List<LineItemRequest> lineItems;
}
