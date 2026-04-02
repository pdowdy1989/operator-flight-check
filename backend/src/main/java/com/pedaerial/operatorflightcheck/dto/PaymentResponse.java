package com.pedaerial.operatorflightcheck.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String id;
    private String invoiceId;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String method;
    private String referenceNote;
    private Instant createdAt;
}
