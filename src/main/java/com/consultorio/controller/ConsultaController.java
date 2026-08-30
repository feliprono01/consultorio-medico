package com.consultorio.controller;

import com.consultorio.dto.ConsultaRequestDTO;
import com.consultorio.dto.ConsultaResponseDTO;
import com.consultorio.service.ConsultaService;
import com.consultorio.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultas")
@RequiredArgsConstructor
public class ConsultaController {

    private final ConsultaService consultaService;
    private final PdfService pdfService;

    @PostMapping
    public ResponseEntity<ConsultaResponseDTO> crearConsulta(@Valid @RequestBody ConsultaRequestDTO dto) {
        ConsultaResponseDTO nuevaConsulta = consultaService.crearConsulta(dto);
        return new ResponseEntity<>(nuevaConsulta, HttpStatus.CREATED);
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<ConsultaResponseDTO>> obtenerHistorial(@PathVariable Long pacienteId) {
        List<ConsultaResponseDTO> historial = consultaService.obtenerHistorial(pacienteId);
        return ResponseEntity.ok(historial);
    }

    @GetMapping("/paciente/{pacienteId}/ultima")
    public ResponseEntity<ConsultaResponseDTO> obtenerUltima(@PathVariable Long pacienteId) {
        ConsultaResponseDTO ultima = consultaService.obtenerUltimaConsulta(pacienteId);
        if (ultima == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(ultima);
    }

    @GetMapping
    public ResponseEntity<Page<ConsultaResponseDTO>> obtenerTodas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(consultaService.obtenerTodas(page, size, q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultaResponseDTO> obtenerPorId(@PathVariable Long id) {
        ConsultaResponseDTO consulta = consultaService.obtenerPorId(id);
        return ResponseEntity.ok(consulta);
    }

    /**
     * Corrige una consulta ya guardada — modelo append-only (Ley 26.657): NO
     * modifica la fila original, crea una nueva versión que la referencia.
     * Reemplaza al viejo PUT /{id} (edición en el lugar).
     * POST /api/consultas/{id}/corregir
     */
    @PostMapping("/{id}/corregir")
    public ResponseEntity<ConsultaResponseDTO> corregirConsulta(@PathVariable Long id,
            @Valid @RequestBody ConsultaRequestDTO dto) {
        ConsultaResponseDTO corregida = consultaService.corregirConsulta(id, dto);
        return ResponseEntity.ok(corregida);
    }

    /**
     * Cadena completa de versiones de una consulta (original + correcciones
     * posteriores, si las hay), de la más vieja a la más nueva.
     * GET /api/consultas/{id}/versiones
     */
    @GetMapping("/{id}/versiones")
    public ResponseEntity<List<ConsultaResponseDTO>> obtenerCadenaVersiones(@PathVariable Long id) {
        return ResponseEntity.ok(consultaService.obtenerCadenaVersiones(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarConsulta(@PathVariable Long id) {
        consultaService.eliminarConsulta(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/historial")
    public ResponseEntity<List<com.consultorio.dto.ConsultaAuditLogDTO>> obtenerHistorialCambios(
            @PathVariable Long id) {
        return ResponseEntity.ok(consultaService.obtenerHistorialCambios(id));
    }

    /**
     * Recorre toda la cadena de auditoría de consultas y confirma que nadie
     * la haya alterado por fuera de la aplicación (ver
     * ConsultaService.verificarCadenaAuditoria). Solo ADMIN.
     * GET /api/consultas/auditoria/verificar-cadena
     */
    @GetMapping("/auditoria/verificar-cadena")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<com.consultorio.dto.VerificacionCadenaDTO> verificarCadenaAuditoria() {
        return ResponseEntity.ok(consultaService.verificarCadenaAuditoria());
    }

    /**
     * Recalcula desde cero el encadenado de hash de toda la tabla de
     * auditoría de consultas. Uso único al activar esta funcionalidad sobre
     * una base que ya tenía registros de auditoría previos (que quedan sin
     * hash y por eso la verificación siempre los reporta rotos) — es
     * idempotente, no inventa contenido. Devuelve el resultado de la
     * verificación después de recalcular. Solo ADMIN.
     * POST /api/consultas/auditoria/backfill-cadena
     */
    @PostMapping("/auditoria/backfill-cadena")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<com.consultorio.dto.VerificacionCadenaDTO> backfillCadenaAuditoria() {
        return ResponseEntity.ok(consultaService.backfillCadenaAuditoria());
    }

    /**
     * Genera y descarga el reporte en PDF del historial de auditoría de
     * cambios de una consulta puntual, listo para entregar a la justicia o
     * a un perito si hace falta demostrar la trazabilidad. Solo ADMIN.
     * GET /api/consultas/{id}/auditoria/exportar
     */
    @GetMapping("/{id}/auditoria/exportar")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<byte[]> exportarAuditoria(@PathVariable Long id) {
        byte[] pdfBytes = pdfService.generarReporteAuditoriaConsulta(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "auditoria-consulta-" + id + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
