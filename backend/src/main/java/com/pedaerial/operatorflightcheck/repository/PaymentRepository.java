package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.Payment;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, String> {

    List<Payment> findByInvoiceIdOrderByPaymentDateDesc(String invoiceId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.invoice.id = :invoiceId")
    BigDecimal sumByInvoiceId(@Param("invoiceId") String invoiceId);
}
