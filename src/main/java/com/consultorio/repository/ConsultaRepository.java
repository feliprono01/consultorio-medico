package com.consultorio.repository;

import com.consultorio.model.Consulta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    java.util.Optional<Consulta> findByIdAndActiveTrue(Long id);

    List<Consulta> findByPacienteIdAndActiveTrue(Long pacienteId);

    /**
     * Últimas 500 consultas activas. Ya no alimenta el listado principal
     * (que pagina en DB, ver findByActiveTrueOrderByFechaConsultaDesc de
     * abajo) — se sigue usando como fuente acotada para el camino de
     * búsqueda con texto libre, porque motivo/diagnóstico están cifrados
     * (AES-GCM no determinístico) y no se pueden filtrar por SQL LIKE.
     */
    List<Consulta> findTop500ByActiveTrueOrderByFechaConsultaDesc();

    /**
     * Paginación real de consultas activas, para el listado principal
     * cuando no hay término de búsqueda.
     */
    Page<Consulta> findByActiveTrueOrderByFechaConsultaDesc(Pageable pageable);

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
