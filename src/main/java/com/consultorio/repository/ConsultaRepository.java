package com.consultorio.repository;

import com.consultorio.model.Consulta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Todas las consultas de acá para afuera de la app (listados, historial,
 * PDF, dashboard) deben ver solo las filas VIGENTES — es decir, las que
 * ninguna otra fila corrige (ver Consulta.correccionDeId). Una vez que una
 * consulta se corrige, la fila original sigue existiendo intacta en la base
 * (append-only, Ley 26.657) pero deja de aparecer en estos listados: solo
 * la última versión de cada visita representa el estado actual del
 * registro clínico. El filtro "NOT EXISTS (... correccionDeId = c.id)" es
 * el mismo en todas las queries de acá — es justamente lo que define
 * "vigente".
 */
@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    java.util.Optional<Consulta> findByIdAndActiveTrue(Long id);

    List<Consulta> findByPacienteIdAndActiveTrue(Long pacienteId);

    /**
     * Últimas ~500 consultas activas y vigentes — fuente acotada para el
     * camino de búsqueda con texto libre, porque motivo/diagnóstico están
     * cifrados (AES-GCM no determinístico) y no se pueden filtrar por SQL
     * LIKE.
     */
    @Query("SELECT c FROM Consulta c WHERE c.active = true " +
            "AND NOT EXISTS (SELECT 1 FROM Consulta co WHERE co.correccionDeId = c.id) " +
            "ORDER BY c.fechaConsulta DESC")
    List<Consulta> findTop500ByActiveTrueOrderByFechaConsultaDesc(Pageable limite);

    /**
     * Paginación real de consultas activas y vigentes, para el listado
     * principal cuando no hay término de búsqueda.
     */
    @Query(value = "SELECT c FROM Consulta c WHERE c.active = true " +
            "AND NOT EXISTS (SELECT 1 FROM Consulta co WHERE co.correccionDeId = c.id) " +
            "ORDER BY c.fechaConsulta DESC",
            countQuery = "SELECT COUNT(c) FROM Consulta c WHERE c.active = true " +
            "AND NOT EXISTS (SELECT 1 FROM Consulta co WHERE co.correccionDeId = c.id)")
    Page<Consulta> findByActiveTrueOrderByFechaConsultaDesc(Pageable pageable);

    /**
     * Cuenta las consultas entre dos fechas.
     */
    long countByFechaConsultaBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    /**
     * Última consulta vigente registrada (dashboard).
     */
    @Query("SELECT c FROM Consulta c WHERE c.active = true " +
            "AND NOT EXISTS (SELECT 1 FROM Consulta co WHERE co.correccionDeId = c.id) " +
            "ORDER BY c.fechaConsulta DESC")
    List<Consulta> findFirstByActiveTrueOrderByFechaConsultaDesc(Pageable limiteUno);

    /**
     * Última consulta vigente de un paciente.
     */
    @Query("SELECT c FROM Consulta c WHERE c.paciente.id = :pacienteId AND c.active = true " +
            "AND NOT EXISTS (SELECT 1 FROM Consulta co WHERE co.correccionDeId = c.id) " +
            "ORDER BY c.fechaConsulta DESC")
    List<Consulta> findFirstByPacienteIdAndActiveTrueOrderByFechaConsultaDesc(@Param("pacienteId") Long pacienteId,
            Pageable limiteUno);

    /**
     * Todas las versiones vigentes de un paciente — una fila por visita,
     * siempre la más corregida. Es lo que ve el médico como "historial".
     */
    @Query("SELECT c FROM Consulta c WHERE c.paciente.id = :pacienteId AND c.active = true " +
            "AND NOT EXISTS (SELECT 1 FROM Consulta co WHERE co.correccionDeId = c.id) " +
            "ORDER BY c.fechaConsulta DESC")
    List<Consulta> findByPacienteIdAndActiveTrueOrderByFechaConsultaDesc(@Param("pacienteId") Long pacienteId);

    /** true si ya existe una corrección posterior de esta fila — usado para
     *  detectar conflictos de concurrencia al corregir (alguien se adelantó). */
    boolean existsByCorreccionDeId(Long correccionDeId);

    /** La fila que corrige a esta, si existe (a lo sumo una, por diseño). */
    java.util.Optional<Consulta> findByCorreccionDeId(Long correccionDeId);
}
