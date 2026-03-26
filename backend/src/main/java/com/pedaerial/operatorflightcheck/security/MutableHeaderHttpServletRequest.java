package com.pedaerial.operatorflightcheck.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

public class MutableHeaderHttpServletRequest extends HttpServletRequestWrapper {

    private final Map<String, String> headers = new HashMap<>();

    public MutableHeaderHttpServletRequest(HttpServletRequest request) {
        super(request);
    }

    public void putHeader(String name, String value) {
        headers.put(name, value);
    }

    @Override
    public String getHeader(String name) {
        String headerValue = headers.get(name);
        if (headerValue != null) {
            return headerValue;
        }
        return ((HttpServletRequest) getRequest()).getHeader(name);
    }

    @Override
    public Enumeration<String> getHeaderNames() {
        Map<String, String> combined = new HashMap<>();
        Enumeration<String> originalHeaderNames = ((HttpServletRequest) getRequest()).getHeaderNames();
        while (originalHeaderNames.hasMoreElements()) {
            String headerName = originalHeaderNames.nextElement();
            combined.put(headerName, ((HttpServletRequest) getRequest()).getHeader(headerName));
        }
        combined.putAll(headers);
        return Collections.enumeration(combined.keySet());
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
        String headerValue = headers.get(name);
        if (headerValue != null) {
            return Collections.enumeration(Collections.singletonList(headerValue));
        }
        return ((HttpServletRequest) getRequest()).getHeaders(name);
    }
}
