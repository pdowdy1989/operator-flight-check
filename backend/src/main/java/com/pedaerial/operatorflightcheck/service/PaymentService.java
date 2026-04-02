package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.PaymentRequest;
import com.pedaerial.operatorflightcheck.dto.PaymentResponse;
import com.pedaerial.operatorflightcheck.entity.Invoice;
import com.pedaerial.operatorflightcheck.entity.InvoiceStatus;
import com.pedaerial.operatorflightcheck.entity.Payment;
import com.pedaerial.operatorflightcheck.entity.PaymentMethod;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.PaymentRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceService invoiceService;

    public PaymentService(PaymentRepository paymentRepository, InvoiceService invoiceService) {
        this.paymentRepository = paymentRepository;
        this.invoiceService = invoiceService;
    }

    @Transactional
    public PaymentResponse recordPayment(String userId, PaymentRequest req) {
        Invoice invoice = invoiceService.getOwnedInvoice(userId, req.getInvoiceId());
        BigDecimal balance = invoiceService.toInvoiceResponse(invoice).getBalanceDue();
        return recordPaymentAgainstInvoice(invoice, balance, req);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInvoice(String userId, String invoiceId) {
        invoiceService.getOwnedInvoice(userId, invoiceId);
        return paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId).stream()
            .map(ResponseMapper::toPaymentResponse)
            .toList();
    }

    @Transactional
    public void deletePayment(String userId, String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + paymentId));
        Invoice invoice = invoiceService.getOwnedInvoice(userId, payment.getInvoiceId());
        paymentRepository.delete(payment);
        BigDecimal remainingPaid = paymentRepository.sumByInvoiceId(invoice.getId());
        BigDecimal balance = invoice.getTotalAmount().subtract(remainingPaid);
        if (InvoiceStatus.PAID.name().equals(invoice.getStatus()) && balance.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.SENT.name());
        }
    }

    @Transactional
    protected PaymentResponse recordPaymentAgainstInvoice(Invoice invoice, BigDecimal balance, PaymentRequest req) {
        if (req.getAmount().compareTo(balance) > 0) {
            throw new BadRequestException("Payment amount exceeds balance due");
        }
        Payment payment = Payment.builder()
            .invoiceId(invoice.getId())
            .amount(req.getAmount())
            .paymentDate(req.getPaymentDate())
            .method(normalizeMethod(req.getMethod()))
            .referenceNote(req.getReferenceNote())
            .build();
        Payment savedPayment = paymentRepository.save(payment);
        BigDecimal newPaid = invoice.getAmountPaid().add(req.getAmount());
        if (newPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID.name());
        }
        return ResponseMapper.toPaymentResponse(savedPayment);
    }

    private String normalizeMethod(String method) {
        try {
            return PaymentMethod.valueOf(method.trim().toUpperCase(Locale.US)).name();
        } catch (Exception ex) {
            throw new BadRequestException("Invalid payment method: " + method);
        }
    }
}
