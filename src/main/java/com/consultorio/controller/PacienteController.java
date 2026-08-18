package com.consultorio.controller;

import com.consultorio.dto.PacienteRequestDTO;
import com.consultorio.dto.PacienteResponseDTO;
import com.consultorio.service.PacienteService;
import com.consultorio.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de Pacientes.
 * Expone endpoints para operaciones CRUD.
 */

@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private static final Logger log = LoggerFactory.getLogger(PacienteController.class);

    private final PacienteService pacienteService;
    private final PdfService pdfService;

    /**
     * Crea un nuevo paciente.
     * POST /api/pacientes
     */
    @PostMapping
    public ResponseEntity<PacienteResponseDTO> crearPaciente(@Valid @RequestBody PacienteRequestDTO requestDTO) {
        log.info("POST /api/pacientes - Crear nuevo paciente");
        PacienteResponseDTO response = pacienteService.crearPaciente(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Obtiene todos los pacientes activos.
     * GET /api/pacientes
     */
    @GetMapping
    public ResponseEntity<List<PacienteResponseDTO>> listarPacientes() {
        log.info("GET /api/pacientes - Listar pacientes activos");
        List<PacienteResponseDTO> pacientes = pacienteService.listarPacientesActivos();
        return ResponseEntity.ok(pacientes);
    }

    /**
     * Lista pacientes activos con paginación real y búsqueda opcional.
     * GET /api/pacientes/pagina?page=&size=&q=
     */
    @GetMapping("/pagina")
    public ResponseEntity<Page<PacienteResponseDTO>> listarPacientesPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q) {
        log.info("GET /api/pacientes/pagina?page={}&size={}&q={} - Listar pacientes paginado", page, size, q);
        return ResponseEntity.ok(pacienteService.listarPacientesPaginado(page, size, q));
    }

    /**
     * Obtiene un paciente por su ID.
     * GET /api/pacientes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PacienteResponseDTO> obtenerPacientePorId(@PathVariable Long id) {
        log.info("GET /api/pacientes/{} - Obtener paciente por ID", id);
        PacienteResponseDTO paciente = pacienteService.obtenerPacientePorId(id);
        return ResponseEntity.ok(paciente);
    }

    /**
     * Busca un paciente por su DNI.
     * GET /api/pacientes/dni/{dni}
     */
    @GetMapping("/dni/{dni}")
    public ResponseEntity<PacienteResponseDTO> obtenerPacientePorDni(@PathVariable String dni) {
        log.info("GET /api/pacientes/dni/{} - Obtener paciente por DNI", dni);
        PacienteResponseDTO paciente = pacienteService.obtenerPacientePorDni(dni);
        return ResponseEntity.ok(paciente);
    }

    /**
     * Busca pacientes por nombre o apellido.
     * GET /api/pacientes/buscar?q={searchTerm}
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<PacienteResponseDTO>> buscarPacientes(@RequestParam String q) {
        log.info("GET /api/pacientes/buscar?q={} - Buscar pacientes", q);
        List<PacienteResponseDTO> pacientes = pacienteService.buscarPacientes(q);
        return ResponseEntity.ok(pacientes);
    }

    /**
     * Actualiza un paciente existente.
     * PUT /api/pacientes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<PacienteResponseDTO> actualizarPaciente(
            @PathVariable Long id,
            @Valid @RequestBody PacienteRequestDTO requestDTO) {
        log.info("PUT /api/pacientes/{} - Actualizar paciente", id);
        PacienteResponseDTO response = pacienteService.actualizarPaciente(id, requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Elimina lógicamente un paciente (soft delete).
     * DELETE /api/pacientes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPaciente(@PathVariable Long id) {
        log.info("DELETE /api/pacientes/{} - Eliminar paciente (soft delete)", id);
        pacienteService.eliminarPaciente(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Actualiza la Historia Psiquiátrica de un paciente.
     * PUT /api/pacientes/{id}/historia-psiquiatrica
     */
    @PutMapping("/{id}/historia-psiquiatrica")
    public ResponseEntity<PacienteResponseDTO> actualizarHistoriaPsiquiatrica(
            @PathVariable Long id,
            @RequestBody com.consultorio.dto.HistoriaPsiquiatricaDTO historiaDTO) {
        log.info("PUT /api/pacientes/{}/historia-psiquiatrica - Actualizar Historia Psiquiátrica", id);
        PacienteResponseDTO response = pacienteService.actualizarHistoriaPsiquiatrica(id, historiaDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * Devuelve el historial de cambios de la Historia Psiquiátrica de un paciente.
     * GET /api/pacientes/{id}/historia-psiquiatrica/historial-cambios
     */
    @GetMapping("/{id}/historia-psiquiatrica/historial-cambios")
    public ResponseEntity<List<com.consultorio.model.HistoriaPsiquiatricaAuditLog>> historialCambiosHp(
            @PathVariable Long id) {
        log.info("GET /api/pacientes/{}/historia-psiquiatrica/historial-cambios", id);
        return ResponseEntity.ok(pacienteService.getHistorialCambiosHp(id));
    }

    /**
     * Genera y descarga la Historia Clínica completa de un paciente en formato PDF.
     * Cumple con el Art. 19 y 20 de la Ley 26.529 (Derecho de acceso a la Historia Clínica).
     * GET /api/pacientes/{id}/historia-clinica/exportar
     */
    @GetMapping("/{id}/historia-clinica/exportar")
    public ResponseEntity<byte[]> exportarHistoriaClinica(@PathVariable Long id) {
        log.info("GET /api/pacientes/{}/historia-clinica/exportar - Generando PDF", id);

        byte[] pdfBytes = pdfService.generarHistoriaClinicaPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "historia-clinica-paciente-" + id + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
