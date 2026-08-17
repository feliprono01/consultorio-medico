package com.consultorio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.consultorio.security.AttributeEncryptor;

/**
 * Registro de cambios en la Historia Psiquiátrica de un paciente.
 *
 * Cada vez que se modifica un campo de HistoriaPsiquiatrica (antecedentes familiares,
 * personales, historia de consumo, enfermedad actual, etc.) se guarda una entrada
 * con el valor anterior, el nuevo valor, quién lo cambió y cuándo.
 *
 * Análogo a ConsultaAuditLog pero para la historia base del paciente,
 * que es distinta a las consultas individuales y cambia con menor frecuencia
 * pero con mayor impacto clínico.
 */
@Entity
@Table(
    name = "historia_psiquiatrica_audit_logs",
    indexes = {
        @Index(name = "idx_hp_audit_paciente_id", columnList = "paciente_id"),
        @Index(name = "idx_hp_audit_fecha",       columnList = "fecha_cambio")
    }
)
public class HistoriaPsiquiatricaAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID del paciente dueño de la historia (sin FK para no complicar la cascada). */
    @Column(name = "paciente_id", nullable = false)
    private Long pacienteId;

    /** Nombre del campo modificado (ej: "Antecedentes Familiares"). */
    @Column(nullable = false, length = 100)
    private String campo;

    /** Valor previo del campo (null si era nuevo). */
    @Column(name = "valor_anterior", columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String valorAnterior;

    /** Valor nuevo del campo. */
    @Column(name = "valor_nuevo", columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String valorNuevo;

    /** Usuario que realizó el cambio. */
    @Column(name = "modificado_por", nullable = false, length = 100)
    private String modificadoPor;

    /** Timestamp del cambio. */
    @Column(name = "fecha_cambio", nullable = false)
    private LocalDateTime fechaCambio;

    public HistoriaPsiquiatricaAuditLog() {}

    public HistoriaPsiquiatricaAuditLog(Long pacienteId, String campo,
            String valorAnterior, String valorNuevo, String modificadoPor) {
        this.pacienteId    = pacienteId;
        this.campo         = campo;
        this.valorAnterior = valorAnterior;
        this.valorNuevo    = valorNuevo;
        this.modificadoPor = modificadoPor;
        this.fechaCambio   = LocalDateTime.now();
    }

    public Long getId()                   { return id; }
    public Long getPacienteId()           { return pacienteId; }
    public String getCampo()              { return campo; }
    public String getValorAnterior()      { return valorAnterior; }
    public String getValorNuevo()         { return valorNuevo; }
    public String getModificadoPor()      { return modificadoPor; }
    public LocalDateTime getFechaCambio() { return fechaCambio; }

    public void setId(Long id)                       { this.id = id; }
    public void setPacienteId(Long pacienteId)       { this.pacienteId = pacienteId; }
    public void setCampo(String campo)               { this.campo = campo; }
    public void setValorAnterior(String v)           { this.valorAnterior = v; }
    public void setValorNuevo(String v)              { this.valorNuevo = v; }
    public void setModificadoPor(String m)           { this.modificadoPor = m; }
    public void setFechaCambio(LocalDateTime fecha)  { this.fechaCambio = fecha; }
}
