package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.PaymentRequest;
import com.pedaerial.operatorflightcheck.dto.PaymentResponse;
import com.pedaerial.operatorflightcheck.service.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> recordPayment(
        @RequestHeader("X-User-Id") String userId,
        @Valid @RequestBody PaymentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.recordPayment(userId, request));
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByInvoice(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String invoiceId
    ) {
        return ResponseEntity.ok(paymentService.getPaymentsByInvoice(userId, invoiceId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(
        @RequestHeader("X-User-Id") String userId,
        @PathVariable String id
    ) {
        paymentService.deletePayment(userId, id);
        return ResponseEntity.noContent().build();
    }
}
