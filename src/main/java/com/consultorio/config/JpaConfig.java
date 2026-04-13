package com.consultorio.config;

import org.springframework.context.annotation.Configuration;

/**
 * Configuración de JPA para habilitar auditoría automática.
 * Permite que los campos anotados con @CreatedDate y @LastModifiedDate
 * se actualicen automáticamente.
 */
@Configuration
public class JpaConfig {
    // La anotación @EnableJpaAuditing se movió a AuditConfig.java
}
