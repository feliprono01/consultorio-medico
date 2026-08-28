package com.consultorio.repository;

import com.consultorio.model.ConsultaAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ConsultaAuditLogRepository extends JpaRepository<ConsultaAuditLog, Long> {
    List<ConsultaAuditLog> findByConsultaIdOrderByFechaCambioDesc(Long consultaId);

    /** Última fila insertada en toda la tabla — el eslabón más reciente de la cadena de integridad. */
    Optional<ConsultaAuditLog> findFirstByOrderByIdDesc();

    /** Toda la tabla en orden de inserción, para recalcular y verificar la cadena completa. */
    List<ConsultaAuditLog> findAllByOrderByIdAsc();
}
