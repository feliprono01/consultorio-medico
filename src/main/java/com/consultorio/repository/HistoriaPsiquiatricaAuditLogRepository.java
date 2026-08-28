package com.consultorio.repository;

import com.consultorio.model.HistoriaPsiquiatricaAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistoriaPsiquiatricaAuditLogRepository
        extends JpaRepository<HistoriaPsiquiatricaAuditLog, Long> {

    /** Historial completo de cambios de la historia psiquiátrica de un paciente, del más reciente al más antiguo. */
    List<HistoriaPsiquiatricaAuditLog> findByPacienteIdOrderByFechaCambioDesc(Long pacienteId);

    /** Última fila insertada en toda la tabla — el eslabón más reciente de la cadena de integridad. */
    Optional<HistoriaPsiquiatricaAuditLog> findFirstByOrderByIdDesc();

    /** Toda la tabla en orden de inserción, para recalcular y verificar la cadena completa. */
    List<HistoriaPsiquiatricaAuditLog> findAllByOrderByIdAsc();
}
