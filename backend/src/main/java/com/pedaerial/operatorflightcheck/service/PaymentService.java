package com.pedaerial.operatorflightcheck.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pedaerial.operatorflightcheck.dto.StripeCheckoutResult;
import com.pedaerial.operatorflightcheck.entity.*;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.InvoiceRepository;
import com.pedaerial.operatorflightcheck.repository.PaymentRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final StripeService stripeService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public StripeCheckoutResult createCheckoutSession(UUID invoiceId, String requesterId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        User requester = userRepository.findById(requesterId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + requesterId));

        // Access check: must be pilot, admin, or the client whose email matches
        boolean isPilot = invoice.getPilot() != null && invoice.getPilot().getId().equals(requesterId);
        boolean isAdmin = requester.getRole() == Role.ADMIN;
        boolean isClient = invoice.getClient() != null
            && invoice.getClient().getEmail() != null
            && invoice.getClient().getEmail().equalsIgnoreCase(requester.getEmail());

        if (!isPilot && !isAdmin && !isClient) {
            throw new UnauthorizedException("Access denied.");
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BadRequestException("Invoice is already paid.");
        }

        return stripeService.createCheckoutSession(invoice);
    }

    public void handleWebhookEvent(String payload, String sigHeader) {
        if (!stripeService.verifyWebhookSignature(payload, sigHeader)) {
            throw new BadRequestException("Invalid webhook signature.");
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            String eventType = root.path("type").asText();

            if ("checkout.session.completed".equals(eventType)) {
                stripeService.extractInvoiceIdFromEvent(payload).ifPresent(invoiceIdStr -> {
                    try {
                        UUID invoiceId = UUID.fromString(invoiceIdStr);
                        Invoice invoice = invoiceRepository.findById(invoiceId).orElse(null);
                        if (invoice != null && invoice.getStatus() != InvoiceStatus.PAID) {
                            invoice.setStatus(InvoiceStatus.PAID);
                            invoice.setPaidDate(LocalDate.now());
                            invoiceRepository.save(invoice);

                            // Create Payment record
                            Payment payment = Payment.builder()
                                .invoice(invoice)
                                .amount(invoice.getTotalAmount())
                                .paymentDate(LocalDate.now())
                                .method(PaymentMethod.CREDIT_CARD)
                                .referenceNote("Stripe checkout.session.completed")
                                .build();
                            paymentRepository.save(payment);
                        }
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid invoice ID in webhook payload: {}", invoiceIdStr);
                    }
                });
            }
        } catch (Exception e) {
            log.error("Error processing webhook event", e);
        }
    }
}
