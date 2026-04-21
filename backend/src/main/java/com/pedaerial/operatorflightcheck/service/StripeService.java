package com.pedaerial.operatorflightcheck.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pedaerial.operatorflightcheck.dto.StripeCheckoutResult;
import com.pedaerial.operatorflightcheck.entity.Invoice;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class StripeService {

    private static final Logger log = LoggerFactory.getLogger(StripeService.class);

    @Value("${stripe.api.secret-key:}")
    private String secretKey;

    @Value("${stripe.webhook.secret:}")
    private String webhookSecret;

    @Value("${stripe.checkout.success-url:http://localhost:5173/payment/success}")
    private String successUrl;

    @Value("${stripe.checkout.cancel-url:http://localhost:5173/payment/cancel}")
    private String cancelUrl;

    private boolean enabled = false;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        if (secretKey != null && !secretKey.isBlank()) {
            Stripe.apiKey = secretKey;
            enabled = true;
        } else {
            log.warn("Stripe API key not configured — checkout will return mock sessions");
        }
    }

    public StripeCheckoutResult createCheckoutSession(Invoice invoice) {
        if (!enabled) {
            String mockId = "mock_" + UUID.randomUUID().toString().replace("-", "");
            String mockUrl = successUrl + "?mock=true&invoiceId=" + invoice.getId();
            return StripeCheckoutResult.builder().sessionId(mockId).url(mockUrl).build();
        }
        try {
            long amountCents = invoice.getTotalAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue();
            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .addLineItem(SessionCreateParams.LineItem.builder()
                    .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                        .setCurrency("usd")
                        .setUnitAmount(amountCents)
                        .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName("Invoice " + invoice.getInvoiceNumber())
                            .build())
                        .build())
                    .setQuantity(1L)
                    .build())
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(cancelUrl)
                .setClientReferenceId(invoice.getId().toString())
                .build();
            Session session = Session.create(params);
            return StripeCheckoutResult.builder().sessionId(session.getId()).url(session.getUrl()).build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Stripe checkout session", e);
        }
    }

    public boolean verifyWebhookSignature(String payload, String sigHeader) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            return true;
        }
        try {
            Webhook.constructEvent(payload, sigHeader, webhookSecret);
            return true;
        } catch (SignatureVerificationException e) {
            return false;
        }
    }

    public Optional<String> extractInvoiceIdFromEvent(String payload) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            JsonNode ref = root.path("data").path("object").path("client_reference_id");
            if (!ref.isMissingNode() && !ref.isNull()) {
                return Optional.of(ref.asText());
            }
        } catch (Exception ignored) {}
        return Optional.empty();
    }
}
