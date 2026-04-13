package com.consultorio.controller;

import com.consultorio.dto.ConsultaRequestDTO;
import com.consultorio.dto.ConsultaResponseDTO;
import com.consultorio.service.ConsultaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultas")
@RequiredArgsConstructor
public class ConsultaController {

    private final ConsultaService consultaService;

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
    public ResponseEntity<List<ConsultaResponseDTO>> obtenerTodas() {
        List<ConsultaResponseDTO> consultas = consultaService.obtenerTodas();
        return ResponseEntity.ok(consultas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultaResponseDTO> obtenerPorId(@PathVariable Long id) {
        ConsultaResponseDTO consulta = consultaService.obtenerPorId(id);
        return ResponseEntity.ok(consulta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConsultaResponseDTO> actualizarConsulta(@PathVariable Long id,
            @Valid @RequestBody ConsultaRequestDTO dto) {
        ConsultaResponseDTO actualizada = consultaService.actualizarConsulta(id, dto);
        return ResponseEntity.ok(actualizada);
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
}
