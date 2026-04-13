package com.consultorio.controller;

import com.consultorio.dto.DashboardStatsDTO;
import com.consultorio.model.Consulta;
import com.consultorio.repository.ConsultaRepository;
import com.consultorio.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final PacienteRepository pacienteRepository;
    private final ConsultaRepository consultaRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        // 1. Total Pacientes
        long totalPacientes = pacienteRepository.countByActiveTrue();

        // 2. Consultas Hoy
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long consultasHoy = consultaRepository.countByFechaConsultaBetween(startOfDay, endOfDay);

        // 3. Última Consulta
        Optional<Consulta> ultimaConsulta = consultaRepository.findFirstByActiveTrueOrderByFechaConsultaDesc();

        String ultimaConsultaFecha = "Sin registros";
        String ultimaConsultaPaciente = "-";

        if (ultimaConsulta.isPresent()) {
            Consulta c = ultimaConsulta.get();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            ultimaConsultaFecha = c.getFechaConsulta().format(formatter) + " hs";
            ultimaConsultaPaciente = c.getPaciente().getNombre() + " " + c.getPaciente().getApellido();
        }

        DashboardStatsDTO stats = DashboardStatsDTO.builder()
                .totalPacientes(totalPacientes)
                .consultasHoy(consultasHoy)
                .ultimaConsulta(ultimaConsultaFecha)
                .pacienteUltimaConsulta(ultimaConsultaPaciente)
                .build();

        return ResponseEntity.ok(stats);
    }
}
