package com.pedaerial.operatorflightcheck.config;

import com.pedaerial.operatorflightcheck.service.AuthService;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DemoDataConfig {

    @Bean
    ApplicationRunner demoUserSeeder(AuthService authService) {
        return args -> authService.seedDemoUser("pilot@pedaerial.com", "password123");
    }
}
