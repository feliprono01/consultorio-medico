package com.consultorio.service;

import com.consultorio.model.AccessLog;
import com.consultorio.repository.AccessLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Servicio para registrar accesos de lectura a información clínica sensible.
 *
 * Los logs se guardan de forma asíncrona (@Async) para que el registro
 * de auditoría no agregue latencia al response del usuario.
 *
 * Uso en servicios:
 *   accessLogService.registrar(pacienteId, "VER_HISTORIAL", "Historial de consultas");
 */
@Service
public class AccessLogService {

    private static final Logger log = LoggerFactory.getLogger(AccessLogService.class);

    /** Constantes de acciones auditadas */
    public static final String VER_HISTORIAL            = "VER_HISTORIAL";
    public static final String VER_FICHA                = "VER_FICHA";
    public static final String VER_HISTORIA_PSIQ        = "VER_HISTORIA_PSIQUIATRICA";
    public static final String VER_CONSULTA             = "VER_CONSULTA";

    private final AccessLogRepository accessLogRepository;

    public AccessLogService(AccessLogRepository accessLogRepository) {
        this.accessLogRepository = accessLogRepository;
    }

    /**
     * Registra un acceso de lectura a información de un paciente.
     * Se ejecuta de forma asíncrona para no impactar la latencia.
     *
     * @param pacienteId ID del paciente cuya info fue accedida
     * @param accion     Tipo de acceso (usar las constantes de esta clase)
     * @param detalle    Información adicional (ej: "Consulta #42")
     */
    @Async
    public void registrar(Long pacienteId, String accion, String detalle) {
        try {
            String usuario = obtenerUsuarioActual();
            String ip      = obtenerIpOrigen();

            AccessLog entry = new AccessLog(usuario, pacienteId, accion, detalle, ip);
            accessLogRepository.save(entry);

        } catch (Exception e) {
            // El log de auditoría NO debe romper el flujo principal
            log.error("Error al registrar access log: {}", e.getMessage());
        }
    }

    /**
     * Obtiene el username del usuario autenticado en el contexto de seguridad actual.
     */
    private String obtenerUsuarioActual() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "SISTEMA";
        }
    }

    /**
     * Obtiene la IP del request actual, respetando proxies (nginx → X-Forwarded-For).
     */
    private String obtenerIpOrigen() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return "DESCONOCIDA";

            HttpServletRequest request = attrs.getRequest();

            String xff = request.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                return xff.split(",")[0].trim();
            }
            String realIp = request.getHeader("X-Real-IP");
            if (realIp != null && !realIp.isBlank()) {
                return realIp.trim();
            }
            return request.getRemoteAddr();
        } catch (Exception e) {
            return "DESCONOCIDA";
        }
    }
}
