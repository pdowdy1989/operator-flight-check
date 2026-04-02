package com.pedaerial.operatorflightcheck.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalClients;
    private long totalMissions;
    private long completedMissions;
    private long plannedMissions;
    private long totalInvoices;
    private long draftInvoices;
    private long sentInvoices;
    private long paidInvoices;
    private long overdueInvoices;
    private BigDecimal totalRevenue;
    private BigDecimal totalOutstanding;
    private BigDecimal totalOverdue;
    private List<InvoiceResponse> recentInvoices;
    private List<MissionResponse> upcomingMissions;
}
