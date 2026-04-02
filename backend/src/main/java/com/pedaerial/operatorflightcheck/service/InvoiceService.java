package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.InvoiceRequest;
import com.pedaerial.operatorflightcheck.dto.InvoiceResponse;
import com.pedaerial.operatorflightcheck.dto.LineItemRequest;
import com.pedaerial.operatorflightcheck.entity.Invoice;
import com.pedaerial.operatorflightcheck.entity.InvoiceStatus;
import com.pedaerial.operatorflightcheck.entity.LineItem;
import com.pedaerial.operatorflightcheck.entity.Mission;
import com.pedaerial.operatorflightcheck.entity.Payment;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.InvoiceRepository;
import com.pedaerial.operatorflightcheck.repository.LineItemRepository;
import com.pedaerial.operatorflightcheck.repository.PaymentRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final LineItemRepository lineItemRepository;
    private final PaymentRepository paymentRepository;
    private final ClientService clientService;
    private final MissionService missionService;

    public InvoiceService(
        InvoiceRepository invoiceRepository,
        LineItemRepository lineItemRepository,
        PaymentRepository paymentRepository,
        ClientService clientService,
        MissionService missionService
    ) {
        this.invoiceRepository = invoiceRepository;
        this.lineItemRepository = lineItemRepository;
        this.paymentRepository = paymentRepository;
        this.clientService = clientService;
        this.missionService = missionService;
    }

    @Transactional
    public InvoiceResponse createInvoice(String userId, InvoiceRequest req) {
        clientService.getOwnedClient(userId, req.getClientId());
        Invoice invoice = Invoice.builder()
            .userId(userId)
            .clientId(req.getClientId())
            .invoiceNumber(nextInvoiceNumber(userId))
            .status(InvoiceStatus.DRAFT.name())
            .issueDate(req.getIssueDate())
            .dueDate(req.getDueDate())
            .notes(req.getNotes())
            .build();
        Invoice savedInvoice = invoiceRepository.save(invoice);
        replaceLineItems(userId, savedInvoice, req.getLineItems());
        return getInvoiceById(userId, savedInvoice.getId());
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getInvoices(String userId, Pageable pageable) {
        return invoiceRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(this::toInvoiceResponse);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(String userId, String invoiceId) {
        return toInvoiceResponse(getOwnedInvoice(userId, invoiceId));
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByClient(String userId, String clientId) {
        clientService.getOwnedClient(userId, clientId);
        return invoiceRepository.findByUserIdAndClientId(userId, clientId).stream()
            .map(this::toInvoiceResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByStatus(String userId, String status) {
        String normalized = normalizeInvoiceStatus(status);
        return invoiceRepository.findByUserIdAndStatus(userId, normalized).stream()
            .map(this::toInvoiceResponse)
            .toList();
    }

    @Transactional
    public InvoiceResponse updateInvoice(String userId, String invoiceId, InvoiceRequest req) {
        Invoice invoice = getOwnedInvoice(userId, invoiceId);
        if (!InvoiceStatus.DRAFT.name().equals(invoice.getStatus())) {
            throw new BadRequestException("Only draft invoices can be edited");
        }
        clientService.getOwnedClient(userId, req.getClientId());
        invoice.setClientId(req.getClientId());
        invoice.setIssueDate(req.getIssueDate());
        invoice.setDueDate(req.getDueDate());
        invoice.setNotes(req.getNotes());
        invoiceRepository.save(invoice);
        replaceLineItems(userId, invoice, req.getLineItems());
        return getInvoiceById(userId, invoiceId);
    }

    @Transactional
    public InvoiceResponse updateInvoiceStatus(String userId, String invoiceId, String newStatus) {
        Invoice invoice = getOwnedInvoice(userId, invoiceId);
        String normalized = normalizeInvoiceStatus(newStatus);
        String current = invoice.getStatus();
        if (InvoiceStatus.PAID.name().equals(current)) {
            throw new BadRequestException("Paid invoices cannot be modified");
        }
        if (!isValidTransition(current, normalized)) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + normalized);
        }
        invoice.setStatus(normalized);
        return getInvoiceById(userId, invoiceRepository.save(invoice).getId());
    }

    @Transactional
    public void deleteInvoice(String userId, String invoiceId) {
        Invoice invoice = getOwnedInvoice(userId, invoiceId);
        if (!InvoiceStatus.DRAFT.name().equals(invoice.getStatus())) {
            throw new BadRequestException("Only draft invoices can be deleted");
        }
        invoiceRepository.delete(invoice);
    }

    @Transactional(readOnly = true)
    protected Invoice getOwnedInvoice(String userId, String invoiceId) {
        return invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));
    }

    @Transactional(readOnly = true)
    protected InvoiceResponse toInvoiceResponse(Invoice invoice) {
        List<LineItem> lineItems = lineItemRepository.findByInvoiceIdOrderBySortOrderAsc(invoice.getId());
        List<Payment> payments = paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoice.getId());
        invoice.setLineItems(new ArrayList<>(lineItems));
        invoice.setPayments(new ArrayList<>(payments));
        return ResponseMapper.toInvoiceResponse(invoice, lineItems, payments);
    }

    private void replaceLineItems(String userId, Invoice invoice, List<LineItemRequest> requests) {
        lineItemRepository.deleteByInvoiceId(invoice.getId());
        invoice.getLineItems().clear();
        int sortOrder = 0;
        for (LineItemRequest request : requests) {
            Mission mission = null;
            if (request.getMissionId() != null && !request.getMissionId().isBlank()) {
                mission = missionService.getOwnedMission(userId, request.getMissionId());
            }
            LineItem lineItem = LineItem.builder()
                .invoiceId(invoice.getId())
                .missionId(mission != null ? mission.getId() : null)
                .description(request.getDescription())
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .sortOrder(sortOrder++)
                .build();
            invoice.getLineItems().add(lineItemRepository.save(lineItem));
        }
    }

    private String nextInvoiceNumber(String userId) {
        int next = invoiceRepository.findMaxInvoiceNumberByUserId(userId).orElse(0) + 1;
        return String.format(Locale.US, "INV-%04d", next);
    }

    private boolean isValidTransition(String current, String target) {
        return (InvoiceStatus.DRAFT.name().equals(current) && InvoiceStatus.SENT.name().equals(target))
            || (InvoiceStatus.SENT.name().equals(current) && InvoiceStatus.PAID.name().equals(target))
            || (InvoiceStatus.SENT.name().equals(current) && InvoiceStatus.OVERDUE.name().equals(target));
    }

    private String normalizeInvoiceStatus(String status) {
        try {
            return InvoiceStatus.valueOf(status.trim().toUpperCase(Locale.US)).name();
        } catch (Exception ex) {
            throw new BadRequestException("Invalid invoice status: " + status);
        }
    }
}
