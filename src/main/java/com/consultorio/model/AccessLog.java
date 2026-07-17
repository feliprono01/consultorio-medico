package com.consultorio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Registro de accesos de lectura a información clínica sensible.
 *
 * Captura: quién accedió, a qué recurso, sobre qué paciente, cuándo y desde qué IP.
 * Es el complemento del ConsultaAuditLog (que registra modificaciones):
 * este registra lecturas, porque en un sistema de salud mental saber quién
 * vio qué es tan importante como saber quién modificó qué.
 *
 * Cumplimiento: Ley 25.326 art. 9, Ley 26.657 art. 8, Disposición ANPDP 2/2019.
 */
@Entity
@Table(
    name = "access_logs",
    indexes = {
        @Index(name = "idx_access_log_paciente_id", columnList = "paciente_id"),
        @Index(name = "idx_access_log_usuario",     columnList = "usuario"),
        @Index(name = "idx_access_log_fecha",       columnList = "fecha_acceso")
    }
)
public class AccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Usuario autenticado que realizó el acceso (username). */
    @Column(nullable = false, length = 100)
    private String usuario;

    /** ID del paciente cuya información fue accedida. */
    @Column(name = "paciente_id", nullable = false)
    private Long pacienteId;

    /** Tipo de acción: "VER_HISTORIAL", "VER_FICHA", "VER_HISTORIA_PSIQUIATRICA", "VER_CONSULTA". */
    @Column(nullable = false, length = 50)
    private String accion;

    /** Detalle adicional (ej: ID de la consulta vista, o nombre del paciente). */
    @Column(length = 200)
    private String detalle;

    /** IP de origen del request (para detectar accesos anómalos). */
    @Column(name = "ip_origen", length = 50)
    private String ipOrigen;

    /** Timestamp del acceso. */
    @Column(name = "fecha_acceso", nullable = false)
    private LocalDateTime fechaAcceso;

    public AccessLog() {}

    public AccessLog(String usuario, Long pacienteId, String accion, String detalle, String ipOrigen) {
        this.usuario     = usuario;
        this.pacienteId  = pacienteId;
        this.accion      = accion;
        this.detalle     = detalle;
        this.ipOrigen    = ipOrigen;
        this.fechaAcceso = LocalDateTime.now();
    }

    public Long getId()                     { return id; }
    public String getUsuario()              { return usuario; }
    public Long getPacienteId()             { return pacienteId; }
    public String getAccion()               { return accion; }
    public String getDetalle()              { return detalle; }
    public String getIpOrigen()             { return ipOrigen; }
    public LocalDateTime getFechaAcceso()   { return fechaAcceso; }

    public void setId(Long id)                      { this.id = id; }
    public void setUsuario(String usuario)          { this.usuario = usuario; }
    public void setPacienteId(Long pacienteId)      { this.pacienteId = pacienteId; }
    public void setAccion(String accion)            { this.accion = accion; }
    public void setDetalle(String detalle)          { this.detalle = detalle; }
    public void setIpOrigen(String ipOrigen)        { this.ipOrigen = ipOrigen; }
    public void setFechaAcceso(LocalDateTime fecha) { this.fechaAcceso = fecha; }
}
