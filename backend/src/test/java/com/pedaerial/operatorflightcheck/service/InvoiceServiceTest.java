package com.pedaerial.operatorflightcheck.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedaerial.operatorflightcheck.dto.InvoiceRequest;
import com.pedaerial.operatorflightcheck.dto.InvoiceResponse;
import com.pedaerial.operatorflightcheck.dto.LineItemRequest;
import com.pedaerial.operatorflightcheck.entity.Client;
import com.pedaerial.operatorflightcheck.entity.Invoice;
import com.pedaerial.operatorflightcheck.entity.LineItem;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.repository.InvoiceRepository;
import com.pedaerial.operatorflightcheck.repository.LineItemRepository;
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
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private LineItemRepository lineItemRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ClientService clientService;

    @Mock
    private MissionService missionService;

    @InjectMocks
    private InvoiceService invoiceService;

    @Test
    void testCreateInvoice_generatesInvoiceNumber() {
        InvoiceRequest request = invoiceRequest();
        when(clientService.getOwnedClient("user-1", "client-1")).thenReturn(Client.builder().id("client-1").name("Client").build());
        when(invoiceRepository.findMaxInvoiceNumberByUserId("user-1")).thenReturn(Optional.of(7));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice invoice = invocation.getArgument(0);
            invoice.setId("invoice-1");
            return invoice;
        });
        when(lineItemRepository.save(any(LineItem.class))).thenAnswer(invocation -> {
            LineItem item = invocation.getArgument(0);
            item.setId("item-1");
            return item;
        });
        when(invoiceRepository.findByIdAndUserId("invoice-1", "user-1")).thenReturn(Optional.of(
            Invoice.builder().id("invoice-1").userId("user-1").clientId("client-1").invoiceNumber("INV-0008")
                .issueDate(request.getIssueDate()).dueDate(request.getDueDate()).lineItems(new java.util.ArrayList<>()).payments(new java.util.ArrayList<>()).build()
        ));
        when(lineItemRepository.findByInvoiceIdOrderBySortOrderAsc("invoice-1")).thenReturn(List.of());
        when(paymentRepository.findByInvoiceIdOrderByPaymentDateDesc("invoice-1")).thenReturn(List.of());

        InvoiceResponse response = invoiceService.createInvoice("user-1", request);

        assertThat(response.getInvoiceNumber()).isEqualTo("INV-0008");
    }

    @Test
    void testCreateInvoice_createsLineItems() {
        InvoiceRequest request = invoiceRequest();
        when(clientService.getOwnedClient("user-1", "client-1")).thenReturn(Client.builder().id("client-1").build());
        when(invoiceRepository.findMaxInvoiceNumberByUserId("user-1")).thenReturn(Optional.empty());
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice invoice = invocation.getArgument(0);
            invoice.setId("invoice-1");
            return invoice;
        });
        when(lineItemRepository.save(any(LineItem.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceRepository.findByIdAndUserId("invoice-1", "user-1")).thenReturn(Optional.of(
            Invoice.builder().id("invoice-1").userId("user-1").clientId("client-1").invoiceNumber("INV-0001")
                .issueDate(request.getIssueDate()).dueDate(request.getDueDate()).lineItems(new java.util.ArrayList<>()).payments(new java.util.ArrayList<>()).build()
        ));
        when(lineItemRepository.findByInvoiceIdOrderBySortOrderAsc("invoice-1")).thenReturn(List.of(LineItem.builder()
            .id("item-1").invoiceId("invoice-1").description("Shoot").quantity(new BigDecimal("1.00")).unitPrice(new BigDecimal("100.00")).amount(new BigDecimal("100.00")).sortOrder(0).build()));
        when(paymentRepository.findByInvoiceIdOrderByPaymentDateDesc("invoice-1")).thenReturn(List.of());

        InvoiceResponse response = invoiceService.createInvoice("user-1", request);

        assertThat(response.getLineItems()).hasSize(1);
    }

    @Test
    void testUpdateInvoice_draftOnly_throwsOnSent() {
        Invoice invoice = Invoice.builder().id("invoice-1").userId("user-1").status("SENT").lineItems(new java.util.ArrayList<>()).payments(new java.util.ArrayList<>()).build();
        when(invoiceRepository.findByIdAndUserId("invoice-1", "user-1")).thenReturn(Optional.of(invoice));

        assertThatThrownBy(() -> invoiceService.updateInvoice("user-1", "invoice-1", invoiceRequest()))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Only draft invoices can be edited");
    }

    @Test
    void testUpdateInvoiceStatus_validTransition() {
        Invoice invoice = Invoice.builder().id("invoice-1").userId("user-1").status("DRAFT").lineItems(new java.util.ArrayList<>()).payments(new java.util.ArrayList<>()).build();
        when(invoiceRepository.findByIdAndUserId("invoice-1", "user-1")).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(invoice)).thenReturn(invoice);
        when(lineItemRepository.findByInvoiceIdOrderBySortOrderAsc("invoice-1")).thenReturn(List.of());
        when(paymentRepository.findByInvoiceIdOrderByPaymentDateDesc("invoice-1")).thenReturn(List.of());

        InvoiceResponse response = invoiceService.updateInvoiceStatus("user-1", "invoice-1", "SENT");

        assertThat(response.getStatus()).isEqualTo("SENT");
    }

    @Test
    void testUpdateInvoiceStatus_invalidTransition_throws() {
        Invoice invoice = Invoice.builder().id("invoice-1").userId("user-1").status("DRAFT").lineItems(new java.util.ArrayList<>()).payments(new java.util.ArrayList<>()).build();
        when(invoiceRepository.findByIdAndUserId("invoice-1", "user-1")).thenReturn(Optional.of(invoice));

        assertThatThrownBy(() -> invoiceService.updateInvoiceStatus("user-1", "invoice-1", "PAID"))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Invalid status transition");
    }

    @Test
    void testDeleteInvoice_draftOnly_throwsOnSent() {
        Invoice invoice = Invoice.builder().id("invoice-1").userId("user-1").status("SENT").lineItems(new java.util.ArrayList<>()).payments(new java.util.ArrayList<>()).build();
        when(invoiceRepository.findByIdAndUserId("invoice-1", "user-1")).thenReturn(Optional.of(invoice));

        assertThatThrownBy(() -> invoiceService.deleteInvoice("user-1", "invoice-1"))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Only draft invoices can be deleted");
    }

    private InvoiceRequest invoiceRequest() {
        return InvoiceRequest.builder()
            .clientId("client-1")
            .issueDate(LocalDate.now())
            .dueDate(LocalDate.now().plusDays(7))
            .lineItems(List.of(LineItemRequest.builder()
                .description("Shoot")
                .quantity(new BigDecimal("1.00"))
                .unitPrice(new BigDecimal("100.00"))
                .build()))
            .build();
    }
}
