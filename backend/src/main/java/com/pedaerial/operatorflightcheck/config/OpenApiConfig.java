package com.pedaerial.operatorflightcheck.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI pedAerialOpenApi() {
        return new OpenAPI()
            .info(new Info()
                .title("PED Aerial API")
                .description("Backend API for drone profiles, saved spots, spot checks, and authentication.")
                .version("v1")
                .contact(new Contact()
                    .name("PED Aerial")
                    .email("support@pedaerial.com"))
                .license(new License()
                    .name("Educational Use")));
    }
}
