package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Optional<Invoice> findByJobId(UUID jobId);
    List<Invoice> findByPilotIdOrderByCreatedAtDesc(String pilotId);
    List<Invoice> findByClientIdOrderByCreatedAtDesc(UUID clientId);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(i.invoiceNumber, 10) AS int)), 0) FROM Invoice i WHERE i.invoiceNumber LIKE :prefix%")
    int findMaxInvoiceNumberForPrefix(@Param("prefix") String prefix);
}
