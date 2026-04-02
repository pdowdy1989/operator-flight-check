package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.LineItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LineItemRepository extends JpaRepository<LineItem, String> {

    List<LineItem> findByInvoiceIdOrderBySortOrderAsc(String invoiceId);

    void deleteByInvoiceId(String invoiceId);
}
