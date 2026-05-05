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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final PacienteRepository pacienteRepository;
    private final ConsultaRepository consultaRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        long totalPacientes = pacienteRepository.countByActiveTrue();

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long consultasHoy = consultaRepository.countByFechaConsultaBetween(startOfDay, endOfDay);

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

    /**
     * Devuelve el conteo de consultas por día para los últimos 7 días.
     * Usado por el gráfico de actividad del dashboard.
     */
    @GetMapping("/actividad-semana")
    public ResponseEntity<List<Map<String, Object>>> getActividadSemana() {
        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("EEE dd");
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate dia = LocalDate.now().minusDays(i);
            LocalDateTime inicio = dia.atStartOfDay();
            LocalDateTime fin = dia.atTime(LocalTime.MAX);
            long count = consultaRepository.countByFechaConsultaBetween(inicio, fin);
            result.add(Map.of(
                "dia", dia.format(labelFormatter),
                "consultas", count
            ));
        }

        return ResponseEntity.ok(result);
    }
}
