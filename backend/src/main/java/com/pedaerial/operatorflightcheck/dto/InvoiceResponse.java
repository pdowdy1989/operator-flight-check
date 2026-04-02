package com.pedaerial.operatorflightcheck.dto;

import java.math.BigDecimal;
import java.time.Instant;
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
public class InvoiceResponse {
    private String id;
    private String clientId;
    private String clientName;
    private String invoiceNumber;
    private String status;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private String notes;
    private List<LineItemResponse> lineItems;
    private List<PaymentResponse> payments;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal balanceDue;
    private Instant createdAt;
    private Instant updatedAt;
}
