package com.example.carrentalbackend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI carRentalOpenAPI() {
        SecurityScheme bearer = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("""
                        1) Chay POST /api/auth/login (admin / Admin@123)
                        2) Copy gia tri "token" (chuoi dai bat dau bang eyJ)
                        3) Dan vao o Value. KHONG dan chu string, Authorize, hoac Bearer
                        """);
        return new OpenAPI()
                .info(new Info()
                        .title("Car Rental API")
                        .version("1.0")
                        .description("Website thuê xe ô tô tự lái - Spring Boot"))
                .components(new Components().addSecuritySchemes("bearerAuth", bearer))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
