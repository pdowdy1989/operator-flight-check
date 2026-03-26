package com.pedaerial.operatorflightcheck.exception;

import org.springframework.http.HttpStatus;

public class DuplicateEmailException extends ApiException {

    public DuplicateEmailException(String email) {
        super(HttpStatus.CONFLICT, "Email already exists: " + email);
    }
}
