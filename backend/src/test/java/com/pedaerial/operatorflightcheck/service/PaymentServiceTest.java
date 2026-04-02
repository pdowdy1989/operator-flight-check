package com.pedaerial.operatorflightcheck.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedaerial.operatorflightcheck.dto.InvoiceResponse;
import com.pedaerial.operatorflightcheck.dto.PaymentRequest;
import com.pedaerial.operatorflightcheck.dto.PaymentResponse;
import com.pedaerial.operatorflightcheck.entity.Invoice;
import com.pedaerial.operatorflightcheck.entity.Payment;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.repository.PaymentRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private InvoiceService invoiceService;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void testRecordPayment_success() {
        Invoice invoice = Invoice.builder().id("invoice-1").status("SENT").lineItems(new java.util.ArrayList<>()).payments(new java.util.ArrayList<>()).build();
        when(invoiceService.getOwnedInvoice("user-1", "invoice-1")).thenReturn(invoice);
        when(invoiceService.toInvoiceResponse(invoice)).thenReturn(InvoiceResponse.builder().balanceDue(new BigDecimal("300.00")).build());
        when(paymentRepository.save(org.mockito.ArgumentMatchers.any(Payment.class))).thenAnswer(invocation -> {
            Payment payment = invocation.getArgument(0);
            payment.setId("payment-1");
            return payment;
        });

        PaymentResponse response = paymentService.recordPayment("user-1", request(new BigDecimal("100.00")));

        assertThat(response.getId()).isEqualTo("payment-1");
    }

    @Test
    void testRecordPayment_exceedsBalance_throws() {
        Invoice invoice = Invoice.builder().id("invoice-1").status("SENT").lineItems(new java.util.ArrayList<>()).payments(new java.util.ArrayList<>()).build();
        when(invoiceService.getOwnedInvoice("user-1", "invoice-1")).thenReturn(invoice);
        when(invoiceService.toInvoiceResponse(invoice)).thenReturn(InvoiceResponse.builder().balanceDue(new BigDecimal("50.00")).build());

        assertThatThrownBy(() -> paymentService.recordPayment("user-1", request(new BigDecimal("75.00"))))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Payment amount exceeds balance due");
    }

    @Test
    void testRecordPayment_autoMarksPaid() {
        Invoice invoice = Invoice.builder()
            .id("invoice-1")
            .status("SENT")
            .lineItems(new java.util.ArrayList<>())
            .payments(new java.util.ArrayList<>())
            .build();
        invoice.setLineItems(List.of(
            com.pedaerial.operatorflightcheck.entity.LineItem.builder().amount(new BigDecimal("100.00")).build()
        ));
        when(invoiceService.getOwnedInvoice("user-1", "invoice-1")).thenReturn(invoice);
        when(invoiceService.toInvoiceResponse(invoice)).thenReturn(InvoiceResponse.builder().balanceDue(new BigDecimal("100.00")).build());
        when(paymentRepository.save(org.mockito.ArgumentMatchers.any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        paymentService.recordPayment("user-1", request(new BigDecimal("100.00")));

        assertThat(invoice.getStatus()).isEqualTo("PAID");
    }

    @Test
    void testDeletePayment_revertsStatusIfNeeded() {
        Payment payment = Payment.builder().id("payment-1").invoiceId("invoice-1").amount(new BigDecimal("100.00")).build();
        Invoice invoice = Invoice.builder().id("invoice-1").status("PAID").lineItems(new java.util.ArrayList<>()).payments(new java.util.ArrayList<>()).build();
        invoice.setLineItems(List.of(
            com.pedaerial.operatorflightcheck.entity.LineItem.builder().amount(new BigDecimal("100.00")).build()
        ));
        when(paymentRepository.findById("payment-1")).thenReturn(Optional.of(payment));
        when(invoiceService.getOwnedInvoice("user-1", "invoice-1")).thenReturn(invoice);
        when(paymentRepository.sumByInvoiceId("invoice-1")).thenReturn(BigDecimal.ZERO);

        paymentService.deletePayment("user-1", "payment-1");

        verify(paymentRepository).delete(payment);
        assertThat(invoice.getStatus()).isEqualTo("SENT");
    }

    private PaymentRequest request(BigDecimal amount) {
        return PaymentRequest.builder()
            .invoiceId("invoice-1")
            .amount(amount)
            .paymentDate(LocalDate.now())
            .method("BANK_TRANSFER")
            .referenceNote("Test")
            .build();
    }
}
