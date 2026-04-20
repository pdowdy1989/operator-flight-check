package com.pedaerial.operatorflightcheck.service;

import com.pedaerial.operatorflightcheck.dto.InvoiceRequest;
import com.pedaerial.operatorflightcheck.dto.InvoiceResponse;
import com.pedaerial.operatorflightcheck.dto.LineItemRequest;
import com.pedaerial.operatorflightcheck.entity.*;
import com.pedaerial.operatorflightcheck.exception.BadRequestException;
import com.pedaerial.operatorflightcheck.exception.UnauthorizedException;
import com.pedaerial.operatorflightcheck.repository.InvoiceRepository;
import com.pedaerial.operatorflightcheck.repository.JobRepository;
import com.pedaerial.operatorflightcheck.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock InvoiceRepository invoiceRepository;
    @Mock JobRepository jobRepository;
    @Mock UserRepository userRepository;
    @Mock ResponseMapper mapper;

    @InjectMocks InvoiceService invoiceService;

    private User pilot;
    private Client client;
    private Job job;

    @BeforeEach
    void setUp() {
        pilot = new User();
        pilot.setId(UUID.randomUUID().toString());
        pilot.setRole(Role.PILOT);

        client = Client.builder()
            .id(UUID.randomUUID())
            .pilot(pilot)
            .name("Test Client")
            .clientType(ClientType.INDIVIDUAL)
            .build();

        job = Job.builder()
            .id(UUID.randomUUID())
            .pilot(pilot)
            .client(client)
            .title("Roof Survey")
            .status(JobStatus.COMPLETED)
            .jobType(JobType.ROOF_SURVEY)
            .siteAddress("123 Main St")
            .build();
    }

    @Test
    void createInvoice_calculatesTotal() {
        List<LineItemRequest> lineItems = List.of(
            new LineItemRequest("Flight fee", new BigDecimal("2"), new BigDecimal("150.00"), 0),
            new LineItemRequest("Report", BigDecimal.ONE, new BigDecimal("75.00"), 1)
        );
        InvoiceRequest request = new InvoiceRequest(job.getId(), new BigDecimal("20.00"), null, null, lineItems);

        when(jobRepository.findById(job.getId())).thenReturn(Optional.of(job));
        when(userRepository.findById(pilot.getId())).thenReturn(Optional.of(pilot));
        when(invoiceRepository.findMaxInvoiceNumberForPrefix(any())).thenReturn(0);
        when(invoiceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toInvoiceResponse(any())).thenReturn(mock(InvoiceResponse.class));

        invoiceService.createInvoice(request, pilot.getId());

        verify(invoiceRepository).save(argThat(inv ->
            inv.getAmount().compareTo(new BigDecimal("375.00")) == 0 &&
            inv.getTotalAmount().compareTo(new BigDecimal("395.00")) == 0
        ));
    }

    @Test
    void createInvoice_autoNumberFormat() {
        List<LineItemRequest> lineItems = List.of(
            new LineItemRequest("Flight", BigDecimal.ONE, new BigDecimal("200.00"), 0)
        );
        InvoiceRequest request = new InvoiceRequest(job.getId(), null, null, null, lineItems);

        when(jobRepository.findById(job.getId())).thenReturn(Optional.of(job));
        when(userRepository.findById(pilot.getId())).thenReturn(Optional.of(pilot));
        when(invoiceRepository.findMaxInvoiceNumberForPrefix(any())).thenReturn(5);
        when(invoiceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toInvoiceResponse(any())).thenReturn(mock(InvoiceResponse.class));

        invoiceService.createInvoice(request, pilot.getId());

        int year = java.time.LocalDate.now().getYear();
        verify(invoiceRepository).save(argThat(inv ->
            inv.getInvoiceNumber().equals("PED-" + year + "-0006")
        ));
    }

    @Test
    void createInvoice_noLineItems_throws() {
        InvoiceRequest request = new InvoiceRequest(job.getId(), null, null, null, List.of());

        when(jobRepository.findById(job.getId())).thenReturn(Optional.of(job));
        when(userRepository.findById(pilot.getId())).thenReturn(Optional.of(pilot));

        assertThatThrownBy(() -> invoiceService.createInvoice(request, pilot.getId()))
            .isInstanceOf(BadRequestException.class);
    }

    @Test
    void deleteInvoice_paidInvoice_throws() {
        Invoice invoice = Invoice.builder()
            .id(UUID.randomUUID())
            .pilot(pilot)
            .job(job)
            .client(client)
            .invoiceNumber("PED-2026-0001")
            .amount(BigDecimal.TEN)
            .totalAmount(BigDecimal.TEN)
            .status(InvoiceStatus.PAID)
            .build();

        when(invoiceRepository.findById(invoice.getId())).thenReturn(Optional.of(invoice));

        assertThatThrownBy(() -> invoiceService.deleteInvoice(invoice.getId(), pilot.getId()))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("paid");
    }

    @Test
    void deleteInvoice_wrongOwner_throws() {
        String otherPilotId = UUID.randomUUID().toString();
        Invoice invoice = Invoice.builder()
            .id(UUID.randomUUID())
            .pilot(pilot)
            .job(job)
            .client(client)
            .invoiceNumber("PED-2026-0001")
            .amount(BigDecimal.TEN)
            .totalAmount(BigDecimal.TEN)
            .status(InvoiceStatus.DRAFT)
            .build();

        when(invoiceRepository.findById(invoice.getId())).thenReturn(Optional.of(invoice));

        assertThatThrownBy(() -> invoiceService.deleteInvoice(invoice.getId(), otherPilotId))
            .isInstanceOf(UnauthorizedException.class);
    }
}
