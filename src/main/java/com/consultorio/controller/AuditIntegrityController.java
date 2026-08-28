package com.consultorio.controller;

import com.consultorio.service.AuditIntegrityMonitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
public class AuditIntegrityController {

    private final AuditIntegrityMonitorService auditIntegrityMonitorService;

    /**
     * Dispara la verificación periódica de las dos cadenas de auditoría de
     * forma inmediata (lo mismo que ejecutaría el cron automático). Manda
     * alerta por mail si alguna cadena no está intacta. Solo para testing y
     * verificación manual — el cron real corre solo cada 6 horas.
     * POST /api/auditoria/verificar-ahora
     */
    @PostMapping("/verificar-ahora")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, String>> verificarAhora() {
        auditIntegrityMonitorService.verificarIntegridadCadenas();
        return ResponseEntity.ok(Map.of("message",
                "Verificación disparada. Revisá los logs del servidor (y tu mail, si alguna cadena estaba rota)."));
    }
}
