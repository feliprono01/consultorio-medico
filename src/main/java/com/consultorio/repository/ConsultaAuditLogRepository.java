package com.consultorio.repository;

import com.consultorio.model.ConsultaAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsultaAuditLogRepository extends JpaRepository<ConsultaAuditLog, Long> {
    List<ConsultaAuditLog> findByConsultaIdOrderByFechaCambioDesc(Long consultaId);
}
