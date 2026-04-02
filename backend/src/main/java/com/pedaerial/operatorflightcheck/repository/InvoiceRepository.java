package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.Invoice;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {

    Page<Invoice> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    Optional<Invoice> findByIdAndUserId(String id, String userId);

    List<Invoice> findByUserIdAndStatus(String userId, String status);

    List<Invoice> findByUserIdAndClientId(String userId, String clientId);

    @Query("SELECT MAX(CAST(SUBSTRING(i.invoiceNumber, 5) AS integer)) FROM Invoice i WHERE i.userId = :userId")
    Optional<Integer> findMaxInvoiceNumberByUserId(@Param("userId") String userId);

    long countByUserId(String userId);

    long countByUserIdAndStatus(String userId, String status);
}
