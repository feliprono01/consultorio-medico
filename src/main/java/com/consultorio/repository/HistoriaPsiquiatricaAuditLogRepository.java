package com.consultorio.repository;

import com.consultorio.model.HistoriaPsiquiatricaAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoriaPsiquiatricaAuditLogRepository
        extends JpaRepository<HistoriaPsiquiatricaAuditLog, Long> {

    /** Historial completo de cambios de la historia psiquiátrica de un paciente, del más reciente al más antiguo. */
    List<HistoriaPsiquiatricaAuditLog> findByPacienteIdOrderByFechaCambioDesc(Long pacienteId);
}
