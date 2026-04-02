package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.Client;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClientRepository extends JpaRepository<Client, String> {

    List<Client> findByUserIdOrderByNameAsc(String userId);

    Optional<Client> findByIdAndUserId(String id, String userId);

    Page<Client> findByUserId(String userId, Pageable pageable);

    @Query("SELECT c FROM Client c WHERE c.userId = :userId AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(c.company, '')) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Client> searchByUserIdAndQuery(@Param("userId") String userId, @Param("q") String query);

    long countByUserId(String userId);
}
