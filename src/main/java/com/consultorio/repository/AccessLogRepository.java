package com.consultorio.repository;

import com.consultorio.model.AccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {

    /** Todos los accesos a los registros de un paciente, del más reciente al más antiguo. */
    List<AccessLog> findByPacienteIdOrderByFechaAccesoDesc(Long pacienteId);

    /** Todos los accesos realizados por un usuario. */
    List<AccessLog> findByUsuarioOrderByFechaAccesoDesc(String usuario);
}
