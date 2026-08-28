package com.consultorio.service;

import com.consultorio.dto.VerificacionCadenaDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Vigía automático de la cadena de integridad de los logs de auditoría
 * (ConsultaAuditLog e HistoriaPsiquiatricaAuditLog).
 *
 * Sin esto, la única forma de enterarse de que alguien alteró un registro de
 * auditoría por fuera de la aplicación era pedir la verificación a mano
 * desde el panel de admin — es decir, nunca, a menos que alguien se acuerde
 * de chequear. Este job corre solo, periódicamente, y si alguna de las dos
 * cadenas deja de estar intacta manda un email de alerta inmediato en vez de
 * esperar a que alguien lo note.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditIntegrityMonitorService {

    private final ConsultaService consultaService;
    private final PacienteService pacienteService;
    private final EmailService emailService;

    @Value("${backup.email.to}")
    private String alertaEmailTo;

    @Scheduled(cron = "${auditoria.verificacion.cron:0 0 */6 * * ?}")
    public void verificarIntegridadCadenas() {
        log.info("Verificación periódica de integridad de auditoría: iniciando...");

        verificarYAlertar("Consultas", consultaService.verificarCadenaAuditoria());
        verificarYAlertar("Historia Psiquiátrica", pacienteService.verificarCadenaAuditoriaHp());

        log.info("Verificación periódica de integridad de auditoría: finalizada.");
    }

    private void verificarYAlertar(String nombreCadena, VerificacionCadenaDTO resultado) {
        if (resultado.isIntacta()) {
            log.info("Cadena de auditoría '{}' intacta ({} registros).", nombreCadena, resultado.getTotalRegistros());
            return;
        }

        log.error("¡ALERTA! Cadena de auditoría '{}' ROTA en el registro id={} (de {} registros totales).",
                nombreCadena, resultado.getPrimerRegistroRoto(), resultado.getTotalRegistros());

        String asunto = "⚠ ALERTA: cadena de auditoría alterada — " + nombreCadena;
        String cuerpo = "La verificación automática detectó que la cadena de integridad de auditoría de '"
                + nombreCadena + "' ya NO está intacta.\n\n"
                + "Primer registro roto: id=" + resultado.getPrimerRegistroRoto() + "\n"
                + "Total de registros en la tabla: " + resultado.getTotalRegistros() + "\n\n"
                + "Esto significa que un registro de auditoría fue modificado o borrado por fuera de la "
                + "aplicación (por ejemplo, con acceso directo a la base de datos) después de haberse creado. "
                + "Revisar cuanto antes quién tuvo acceso a la base en ese período y comparar contra el último "
                + "backup disponible para determinar qué cambió.";

        emailService.sendEmail(alertaEmailTo, asunto, cuerpo);
    }
}
