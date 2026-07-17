package com.consultorio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Clase principal de la aplicación Spring Boot
 * Sistema de Gestión de Consultorios Médicos
 */
@SpringBootApplication
@EnableScheduling   // Activa tareas programadas (limpieza automática de blacklist de JWT)
public class ConsultorioMedicoApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConsultorioMedicoApplication.class, args);
    }
}
