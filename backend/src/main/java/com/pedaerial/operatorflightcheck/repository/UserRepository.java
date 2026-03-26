package com.pedaerial.operatorflightcheck.repository;

import com.pedaerial.operatorflightcheck.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);
}
