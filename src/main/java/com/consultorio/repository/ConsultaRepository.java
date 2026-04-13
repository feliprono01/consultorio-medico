package com.consultorio.repository;

import com.consultorio.model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
    List<Consulta> findByPacienteIdAndActiveTrue(Long pacienteId);

    List<Consulta> findByActiveTrueOrderByFechaConsultaDesc();

    /**
     * Cuenta las consultas entre dos fechas.
     */
    long countByFechaConsultaBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    /**
     * Obtiene la última consulta registrada.
     */
    java.util.Optional<Consulta> findFirstByActiveTrueOrderByFechaConsultaDesc();

    /**
     * Obtiene la última consulta de un paciente.
     */
    java.util.Optional<Consulta> findFirstByPacienteIdAndActiveTrueOrderByFechaConsultaDesc(Long pacienteId);

    List<Consulta> findByPacienteIdAndActiveTrueOrderByFechaConsultaDesc(Long pacienteId);
}
