package com.pedaerial.operatorflightcheck.dto.clientportal;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientPortalResponse {
    private String clientName;
    private String missionTitle;
    private String status;
    private String progressStep;
    private LocalDate missionDate;
    private BigDecimal amountDue;
    private BigDecimal amountPaid;
    private BigDecimal balanceDue;
    private boolean isPaid;
}
