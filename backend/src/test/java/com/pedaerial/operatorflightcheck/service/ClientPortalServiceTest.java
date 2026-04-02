package com.pedaerial.operatorflightcheck.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedaerial.operatorflightcheck.dto.InvoiceResponse;
import com.pedaerial.operatorflightcheck.dto.clientportal.ClientPortalResponse;
import com.pedaerial.operatorflightcheck.dto.clientportal.DeliverableResponse;
import com.pedaerial.operatorflightcheck.dto.clientportal.PaymentPublicRequest;
import com.pedaerial.operatorflightcheck.entity.Client;
import com.pedaerial.operatorflightcheck.entity.ClientPortalAccess;
import com.pedaerial.operatorflightcheck.entity.Deliverable;
import com.pedaerial.operatorflightcheck.entity.Invoice;
import com.pedaerial.operatorflightcheck.entity.Mission;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.ClientPortalAccessRepository;
import com.pedaerial.operatorflightcheck.repository.DeliverableRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ClientPortalServiceTest {

    @Mock
    private ClientPortalAccessRepository clientPortalAccessRepository;

    @Mock
    private DeliverableRepository deliverableRepository;

    @Mock
    private InvoiceService invoiceService;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private ClientPortalService clientPortalService;

    @Test
    void validTokenReturnsData() {
        ClientPortalAccess access = activeAccess("SENT", "COMPLETED");
        when(clientPortalAccessRepository.findByTokenAndActiveTrue("valid-token")).thenReturn(Optional.of(access));
        when(invoiceService.toInvoiceResponse(access.getInvoice())).thenReturn(invoiceResponse("SENT", new BigDecimal("500.00"), new BigDecimal("150.00"), new BigDecimal("350.00")));

        ClientPortalResponse response = clientPortalService.getPortal("valid-token");

        assertThat(response.getClientName()).isEqualTo("Summit Real Estate");
        assertThat(response.getMissionTitle()).isEqualTo("Listing Shoot");
        assertThat(response.getProgressStep()).isEqualTo("DELIVERED");
    }

    @Test
    void expiredTokenThrowsError() {
        ClientPortalAccess access = activeAccess("SENT", "COMPLETED");
        access.setExpiresAt(LocalDateTime.now().minusMinutes(5));
        when(clientPortalAccessRepository.findByTokenAndActiveTrue("expired")).thenReturn(Optional.of(access));

        assertThatThrownBy(() -> clientPortalService.getPortal("expired"))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Link expired");
    }

    @Test
    void invalidTokenThrowsError() {
        when(clientPortalAccessRepository.findByTokenAndActiveTrue("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clientPortalService.getPortal("missing"))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessageContaining("Invalid or inactive client portal link");
    }

    @Test
    void deliverablesLockedUntilPaid() {
        ClientPortalAccess access = activeAccess("SENT", "COMPLETED");
        when(clientPortalAccessRepository.findByTokenAndActiveTrue("valid-token")).thenReturn(Optional.of(access));

        assertThatThrownBy(() -> clientPortalService.getDeliverables("valid-token"))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessageContaining("locked");
    }

    @Test
    void paymentReducesBalance() {
        ClientPortalAccess access = activeAccess("SENT", "COMPLETED");
        when(clientPortalAccessRepository.findByTokenAndActiveTrue("valid-token")).thenReturn(Optional.of(access));
        when(invoiceService.toInvoiceResponse(access.getInvoice()))
            .thenReturn(invoiceResponse("SENT", new BigDecimal("500.00"), new BigDecimal("150.00"), new BigDecimal("350.00")))
            .thenReturn(invoiceResponse("PAID", new BigDecimal("500.00"), new BigDecimal("500.00"), BigDecimal.ZERO));

        ClientPortalResponse response = clientPortalService.processPayment(
            "valid-token",
            PaymentPublicRequest.builder().amount(new BigDecimal("350.00")).method("BANK_TRANSFER").build()
        );

        verify(paymentService).recordPayment(any(), any());
        assertThat(response.getBalanceDue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.isPaid()).isTrue();
    }

    @Test
    void deliverablesAvailableWhenCompletedAndPaid() {
        ClientPortalAccess access = activeAccess("PAID", "COMPLETED");
        when(clientPortalAccessRepository.findByTokenAndActiveTrue("valid-token")).thenReturn(Optional.of(access));
        when(deliverableRepository.findByMissionId("mission-1")).thenReturn(List.of(
            Deliverable.builder().id("deliv-1").fileUrl("https://cdn.example.com/file.mp4").fileName("file.mp4").fileType("VIDEO").build()
        ));

        List<DeliverableResponse> response = clientPortalService.getDeliverables("valid-token");

        assertThat(response).hasSize(1);
        assertThat(response.get(0).getFileType()).isEqualTo("VIDEO");
    }

    private ClientPortalAccess activeAccess(String invoiceStatus, String missionStatus) {
        Client client = Client.builder().id("client-1").name("Summit Real Estate").build();
        Mission mission = Mission.builder().id("mission-1").title("Listing Shoot").missionDate(LocalDate.now()).status(missionStatus).client(client).build();
        Invoice invoice = Invoice.builder().id("invoice-1").userId("user-1").status(invoiceStatus).build();
        return ClientPortalAccess.builder()
            .id("portal-1")
            .token("valid-token")
            .client(client)
            .mission(mission)
            .invoice(invoice)
            .active(true)
            .expiresAt(LocalDateTime.now().plusDays(2))
            .build();
    }

    private InvoiceResponse invoiceResponse(String status, BigDecimal total, BigDecimal paid, BigDecimal balance) {
        return InvoiceResponse.builder()
            .status(status)
            .totalAmount(total)
            .amountPaid(paid)
            .balanceDue(balance)
            .build();
    }
}
