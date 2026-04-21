package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.InvoiceRequest;
import com.pedaerial.operatorflightcheck.dto.InvoiceResponse;
import com.pedaerial.operatorflightcheck.entity.*;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.ClientRepository;
import com.pedaerial.operatorflightcheck.repository.InvoiceRepository;
import com.pedaerial.operatorflightcheck.repository.JobRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ResponseMapper mapper;

    public InvoiceService(InvoiceRepository invoiceRepository, JobRepository jobRepository,
                          UserRepository userRepository, ClientRepository clientRepository,
                          ResponseMapper mapper) {
        this.invoiceRepository = invoiceRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.mapper = mapper;
    }

    public InvoiceResponse createInvoice(InvoiceRequest request, String pilotId) {
        Job job = jobRepository.findById(request.jobId())
            .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + request.jobId()));

        User pilot = userRepository.findById(pilotId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + pilotId));

        if (request.lineItems() == null || request.lineItems().isEmpty()) {
            throw new BadRequestException("At least one line item is required.");
        }

        String invoiceNumber = generateInvoiceNumber();
        BigDecimal taxAmount = request.taxAmount() != null ? request.taxAmount() : BigDecimal.ZERO;

        Invoice invoice = Invoice.builder()
            .job(job)
            .pilot(pilot)
            .invoiceNumber(invoiceNumber)
            .client(job.getClient())
            .taxAmount(taxAmount)
            .status(InvoiceStatus.DRAFT)
            .dueDate(request.dueDate())
            .notes(request.notes())
            .lineItems(new ArrayList<>())
            .build();

        // Build line items and calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        for (int i = 0; i < request.lineItems().size(); i++) {
            var li = request.lineItems().get(i);
            BigDecimal amount = li.quantity().multiply(li.unitPrice());
            subtotal = subtotal.add(amount);

            LineItem lineItem = LineItem.builder()
                .invoice(invoice)
                .description(li.description())
                .quantity(li.quantity())
                .unitPrice(li.unitPrice())
                .amount(amount)
                .sortOrder(li.sortOrder() != null ? li.sortOrder() : i)
                .build();
            invoice.getLineItems().add(lineItem);
        }

        invoice.setAmount(subtotal);
        invoice.setTotalAmount(subtotal.add(taxAmount));

        return mapper.toInvoiceResponse(invoiceRepository.save(invoice));
    }

    public InvoiceResponse updateInvoiceStatus(UUID invoiceId, InvoiceStatus newStatus, String requesterId) {
        Invoice invoice = findInvoiceOwned(invoiceId, requesterId);
        invoice.setStatus(newStatus);
        if (newStatus == InvoiceStatus.PAID) {
            invoice.setPaidDate(LocalDate.now());
        }
        return mapper.toInvoiceResponse(invoiceRepository.save(invoice));
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesForPilot(String pilotId) {
        return invoiceRepository.findByPilotIdOrderByCreatedAtDesc(pilotId)
            .stream().map(mapper::toInvoiceResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesForClient(UUID clientId) {
        return invoiceRepository.findByClientIdOrderByCreatedAtDesc(clientId)
            .stream().map(mapper::toInvoiceResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesForClientUser(String userId) {
        Client client = resolveClientForUser(userId);
        return getInvoicesForClient(client.getId());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(UUID invoiceId, String requesterId) {
        Invoice invoice = findInvoiceAccessible(invoiceId, requesterId);
        return mapper.toInvoiceResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByJob(UUID jobId) {
        Invoice invoice = invoiceRepository.findByJobId(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for job: " + jobId));
        return mapper.toInvoiceResponse(invoice);
    }

    public void deleteInvoice(UUID invoiceId, String requesterId) {
        Invoice invoice = findInvoiceOwned(invoiceId, requesterId);
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("Cannot delete a paid invoice.");
        }
        invoiceRepository.delete(invoice);
    }

    @Transactional(readOnly = true)
    public Invoice getInvoiceEntity(UUID invoiceId) {
        return invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));
    }

    private Invoice findInvoiceOwned(UUID invoiceId, String requesterId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));
        if (!invoice.getPilot().getId().equals(requesterId)) {
            throw new UnauthorizedException("Access denied.");
        }
        return invoice;
    }

    private Invoice findInvoiceAccessible(UUID invoiceId, String requesterId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        User requester = userRepository.findById(requesterId).orElse(null);
        boolean isPilot = invoice.getPilot() != null && invoice.getPilot().getId().equals(requesterId);
        boolean isClient = requester != null
            && requester.getRole() == Role.CLIENT
            && invoice.getClient() != null
            && invoice.getClient().getEmail() != null
            && invoice.getClient().getEmail().equalsIgnoreCase(requester.getEmail());
        boolean isAdmin = requester != null && requester.getRole() == Role.ADMIN;

        if (!isPilot && !isClient && !isAdmin) {
            throw new UnauthorizedException("Access denied.");
        }
        return invoice;
    }

    private Client resolveClientForUser(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return clientRepository.findByEmailIgnoreCase(user.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("Client profile not found for: " + user.getEmail()));
    }

    private String generateInvoiceNumber() {
        int year = LocalDate.now().getYear();
        String prefix = "PED-" + year + "-";
        int maxNum = invoiceRepository.findMaxInvoiceNumberForPrefix(prefix);
        return prefix + String.format("%04d", maxNum + 1);
    }
}
