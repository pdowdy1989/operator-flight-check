package com.pedaerial.operatorflightcheck.controller;

import com.pedaerial.operatorflightcheck.dto.StripeCheckoutResult;
import com.pedaerial.operatorflightcheck.security.AppUserPrincipal;
import com.pedaerial.operatorflightcheck.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/checkout-session/{invoiceId}")
    public ResponseEntity<StripeCheckoutResult> createCheckout(
            @PathVariable UUID invoiceId,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(paymentService.createCheckoutSession(invoiceId, principal.getId()));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        paymentService.handleWebhookEvent(payload, sigHeader != null ? sigHeader : "");
        return ResponseEntity.ok().build();
    }
}
