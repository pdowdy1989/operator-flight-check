package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.LineItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LineItemRepository extends JpaRepository<LineItem, UUID> {
    List<LineItem> findByInvoiceIdOrderBySortOrderAsc(UUID invoiceId);
}
