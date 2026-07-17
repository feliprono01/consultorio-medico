package com.consultorio.controller;

import com.consultorio.model.AccessLog;
import com.consultorio.repository.AccessLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoint para consultar el log de accesos a información clínica.
 * Solo accesible por ADMIN — permite auditar quién accedió a qué y cuándo.
 *
 * GET /api/access-logs/paciente/{id}  → Todos los accesos a un paciente
 * GET /api/access-logs/usuario/{u}    → Todos los accesos realizados por un usuario
 */
@RestController
@RequestMapping("/api/access-logs")
@PreAuthorize("hasAuthority('ADMIN')")
public class AccessLogController {

    private final AccessLogRepository accessLogRepository;

    public AccessLogController(AccessLogRepository accessLogRepository) {
        this.accessLogRepository = accessLogRepository;
    }

    /**
     * Devuelve todos los accesos registrados para un paciente específico.
     * Útil para saber quién vio la HC de un paciente y cuándo.
     */
    @GetMapping("/paciente/{id}")
    public ResponseEntity<List<AccessLog>> porPaciente(@PathVariable Long id) {
        List<AccessLog> logs = accessLogRepository.findByPacienteIdOrderByFechaAccesoDesc(id);
        return ResponseEntity.ok(logs);
    }

    /**
     * Devuelve todos los accesos realizados por un usuario específico.
     * Útil para auditar el comportamiento de un profesional.
     */
    @GetMapping("/usuario/{username}")
    public ResponseEntity<List<AccessLog>> porUsuario(@PathVariable String username) {
        List<AccessLog> logs = accessLogRepository.findByUsuarioOrderByFechaAccesoDesc(username);
        return ResponseEntity.ok(logs);
    }
}
