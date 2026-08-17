package com.consultorio.repository;

import com.consultorio.model.AccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {

    /**
     * Últimos 1000 accesos a los registros de un paciente, del más reciente al
     * más antiguo. Tope de seguridad — los logs de auditoría crecen más rápido
     * que pacientes/consultas, paginación real queda como mejora futura.
     */
    List<AccessLog> findTop1000ByPacienteIdOrderByFechaAccesoDesc(Long pacienteId);

    /** Últimos 1000 accesos realizados por un usuario. */
    List<AccessLog> findTop1000ByUsuarioOrderByFechaAccesoDesc(String usuario);
}
