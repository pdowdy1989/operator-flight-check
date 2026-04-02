package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.DashboardResponse;
import com.pedaerial.operatorflightcheck.dto.InvoiceResponse;
import com.pedaerial.operatorflightcheck.dto.MissionResponse;
import com.pedaerial.operatorflightcheck.entity.InvoiceStatus;
import com.pedaerial.operatorflightcheck.repository.ClientRepository;
import com.pedaerial.operatorflightcheck.repository.InvoiceRepository;
import com.pedaerial.operatorflightcheck.repository.MissionRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private final ClientRepository clientRepository;
    private final MissionRepository missionRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;

    public DashboardService(
        ClientRepository clientRepository,
        MissionRepository missionRepository,
        InvoiceRepository invoiceRepository,
        InvoiceService invoiceService
    ) {
        this.clientRepository = clientRepository;
        this.missionRepository = missionRepository;
        this.invoiceRepository = invoiceRepository;
        this.invoiceService = invoiceService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String userId) {
        List<InvoiceResponse> recentInvoices = invoiceRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5))
            .stream()
            .map(invoiceService::toInvoiceResponse)
            .toList();
        List<MissionResponse> upcomingMissions = missionRepository
            .findTop5ByUserIdAndStatusAndMissionDateGreaterThanEqualOrderByMissionDateAsc(
                userId,
                "PLANNED",
                LocalDate.now()
            )
            .stream()
            .map(ResponseMapper::toMissionResponse)
            .toList();

        BigDecimal totalRevenue = sumInvoiceAmounts(invoiceRepository.findByUserIdAndStatus(userId, InvoiceStatus.PAID.name()));
        BigDecimal totalOutstanding = sumInvoiceBalances(invoiceRepository.findByUserIdAndStatus(userId, InvoiceStatus.SENT.name()));
        BigDecimal totalOverdue = sumInvoiceBalances(invoiceRepository.findByUserIdAndStatus(userId, InvoiceStatus.OVERDUE.name()));

        return DashboardResponse.builder()
            .totalClients(clientRepository.countByUserId(userId))
            .totalMissions(missionRepository.countByUserId(userId))
            .completedMissions(missionRepository.countByUserIdAndStatus(userId, "COMPLETED"))
            .plannedMissions(missionRepository.countByUserIdAndStatus(userId, "PLANNED"))
            .totalInvoices(invoiceRepository.countByUserId(userId))
            .draftInvoices(invoiceRepository.countByUserIdAndStatus(userId, "DRAFT"))
            .sentInvoices(invoiceRepository.countByUserIdAndStatus(userId, "SENT"))
            .paidInvoices(invoiceRepository.countByUserIdAndStatus(userId, "PAID"))
            .overdueInvoices(invoiceRepository.countByUserIdAndStatus(userId, "OVERDUE"))
            .totalRevenue(totalRevenue)
            .totalOutstanding(totalOutstanding)
            .totalOverdue(totalOverdue)
            .recentInvoices(recentInvoices)
            .upcomingMissions(upcomingMissions)
            .build();
    }

    private BigDecimal sumInvoiceAmounts(List<com.pedaerial.operatorflightcheck.entity.Invoice> invoices) {
        return invoices.stream()
            .map(invoiceService::toInvoiceResponse)
            .map(InvoiceResponse::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumInvoiceBalances(List<com.pedaerial.operatorflightcheck.entity.Invoice> invoices) {
        return invoices.stream()
            .map(invoiceService::toInvoiceResponse)
            .map(InvoiceResponse::getBalanceDue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
