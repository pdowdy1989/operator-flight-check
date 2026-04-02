package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.InvoiceResponse;
import com.pedaerial.operatorflightcheck.dto.PaymentRequest;
import com.pedaerial.operatorflightcheck.dto.clientportal.ClientPortalResponse;
import com.pedaerial.operatorflightcheck.dto.clientportal.DeliverableResponse;
import com.pedaerial.operatorflightcheck.dto.clientportal.PaymentPublicRequest;
import com.pedaerial.operatorflightcheck.entity.ClientPortalAccess;
import com.pedaerial.operatorflightcheck.entity.Deliverable;
import com.pedaerial.operatorflightcheck.entity.Invoice;
import com.pedaerial.operatorflightcheck.entity.InvoiceStatus;
import com.pedaerial.operatorflightcheck.entity.Mission;
import com.pedaerial.operatorflightcheck.entity.MissionStatus;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.ClientPortalAccessRepository;
import com.pedaerial.operatorflightcheck.repository.DeliverableRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClientPortalService {

    private final ClientPortalAccessRepository clientPortalAccessRepository;
    private final DeliverableRepository deliverableRepository;
    private final InvoiceService invoiceService;
    private final PaymentService paymentService;

    public ClientPortalService(
        ClientPortalAccessRepository clientPortalAccessRepository,
        DeliverableRepository deliverableRepository,
        InvoiceService invoiceService,
        PaymentService paymentService
    ) {
        this.clientPortalAccessRepository = clientPortalAccessRepository;
        this.deliverableRepository = deliverableRepository;
        this.invoiceService = invoiceService;
        this.paymentService = paymentService;
    }

    @Transactional(readOnly = true)
    public ClientPortalResponse getPortal(String token) {
        ClientPortalAccess access = requireValidToken(token);
        return mapPortalResponse(access);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStatus(String token) {
        ClientPortalAccess access = requireValidToken(token);
        ClientPortalResponse response = mapPortalResponse(access);
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("clientName", response.getClientName());
        status.put("missionTitle", response.getMissionTitle());
        status.put("status", response.getStatus());
        status.put("progressStep", response.getProgressStep());
        status.put("missionDate", response.getMissionDate());
        status.put("isPaid", response.isPaid());
        return status;
    }

    @Transactional(readOnly = true)
    public List<DeliverableResponse> getDeliverables(String token) {
        ClientPortalAccess access = requireValidToken(token);
        Mission mission = access.getMission();
        Invoice invoice = access.getInvoice();
        if (mission == null || !MissionStatus.COMPLETED.name().equals(mission.getStatus())) {
            throw new UnauthorizedException("Deliverables are not available yet.");
        }
        if (invoice != null && !InvoiceStatus.PAID.name().equals(invoice.getStatus())) {
            throw new UnauthorizedException("Deliverables are locked until the invoice is paid.");
        }
        return deliverableRepository.findByMissionId(mission.getId()).stream()
            .map(this::mapDeliverable)
            .toList();
    }

    @Transactional
    public ClientPortalResponse processPayment(String token, PaymentPublicRequest req) {
        ClientPortalAccess access = requireValidToken(token);
        Invoice invoice = access.getInvoice();
        if (invoice == null) {
            throw new BadRequestException("No invoice is attached to this portal link");
        }
        InvoiceResponse invoiceResponse = invoiceService.toInvoiceResponse(invoice);
        if (req.getAmount().compareTo(invoiceResponse.getBalanceDue()) > 0) {
            throw new BadRequestException("Payment amount exceeds balance due");
        }
        paymentService.recordPayment(
            invoice.getUserId(),
            PaymentRequest.builder()
                .invoiceId(invoice.getId())
                .amount(req.getAmount())
                .method(req.getMethod())
                .paymentDate(java.time.LocalDate.now())
                .referenceNote("Client portal payment")
                .build()
        );
        return getPortal(token);
    }

    protected String computeProgressStep(Mission mission, Invoice invoice) {
        if (mission != null && MissionStatus.PLANNED.name().equals(mission.getStatus())) {
            return "SCHEDULED";
        }
        if (mission != null && MissionStatus.COMPLETED.name().equals(mission.getStatus()) && invoice == null) {
            return "FLIGHT_COMPLETE";
        }
        if (mission != null && MissionStatus.COMPLETED.name().equals(mission.getStatus())
            && invoice != null && InvoiceStatus.DRAFT.name().equals(invoice.getStatus())) {
            return "EDITING";
        }
        if (invoice != null && InvoiceStatus.SENT.name().equals(invoice.getStatus())) {
            return "DELIVERED";
        }
        if (invoice != null && InvoiceStatus.PAID.name().equals(invoice.getStatus())) {
            return "PAID";
        }
        return mission != null ? mission.getStatus() : "UNKNOWN";
    }

    private ClientPortalAccess requireValidToken(String token) {
        ClientPortalAccess access = clientPortalAccessRepository.findByTokenAndActiveTrue(token)
            .orElseThrow(() -> new UnauthorizedException("Invalid or inactive client portal link"));
        if (access.getExpiresAt() != null && access.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Link expired");
        }
        return access;
    }

    private ClientPortalResponse mapPortalResponse(ClientPortalAccess access) {
        Mission mission = access.getMission();
        Invoice invoice = access.getInvoice();
        InvoiceResponse invoiceResponse = invoice == null ? null : invoiceService.toInvoiceResponse(invoice);
        BigDecimal totalAmount = invoiceResponse != null ? invoiceResponse.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal amountPaid = invoiceResponse != null ? invoiceResponse.getAmountPaid() : BigDecimal.ZERO;
        BigDecimal balanceDue = invoiceResponse != null ? invoiceResponse.getBalanceDue() : BigDecimal.ZERO;
        String effectiveStatus = mission != null ? mission.getStatus() : (invoice != null ? invoice.getStatus() : null);
        if (invoiceResponse != null && invoiceResponse.getStatus() != null) {
            effectiveStatus = invoiceResponse.getStatus();
        }
        boolean isPaid = invoiceResponse != null
            ? InvoiceStatus.PAID.name().equals(invoiceResponse.getStatus())
            : invoice != null && InvoiceStatus.PAID.name().equals(invoice.getStatus());
        return ClientPortalResponse.builder()
            .clientName(access.getClient().getName())
            .missionTitle(mission != null ? mission.getTitle() : null)
            .status(effectiveStatus)
            .progressStep(computeProgressStep(mission, invoice))
            .missionDate(mission != null ? mission.getMissionDate() : null)
            .amountDue(totalAmount)
            .amountPaid(amountPaid)
            .balanceDue(balanceDue)
            .isPaid(isPaid)
            .build();
    }

    private DeliverableResponse mapDeliverable(Deliverable deliverable) {
        return DeliverableResponse.builder()
            .id(deliverable.getId())
            .fileUrl(deliverable.getFileUrl())
            .fileName(deliverable.getFileName())
            .fileType(deliverable.getFileType())
            .build();
    }
}
