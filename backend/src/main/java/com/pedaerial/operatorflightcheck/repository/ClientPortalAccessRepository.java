package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.ClientPortalAccess;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientPortalAccessRepository extends JpaRepository<ClientPortalAccess, String> {

    Optional<ClientPortalAccess> findByTokenAndActiveTrue(String token);
}
