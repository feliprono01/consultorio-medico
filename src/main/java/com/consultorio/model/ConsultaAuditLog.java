package com.consultorio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.consultorio.security.AttributeEncryptor;

@Entity
@Table(name = "consulta_audit_logs")
public class ConsultaAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consulta_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "paciente", "evaluacionPsiquiatrica",
            "historiaPsiquiatrica" })
    private Consulta consulta;

    @Column(nullable = false)
    private String campo; // "Diagnóstico", "Tratamiento", etc.

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String valorAnterior;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String valorNuevo;

    @Column(nullable = false)
    private LocalDateTime fechaCambio;

    @Column(nullable = false)
    private String modificadoPor;

    /**
     * Encadenado de integridad (tamper-evidence): cada fila guarda el hash
     * SHA-256 de sí misma y el hash de la fila anterior de esta tabla (no
     * de esta consulta puntual — es una sola cadena para toda la tabla).
     * Si alguien edita o borra un registro en el medio, aunque tenga
     * acceso directo a la base, la cadena se rompe a partir de ahí y se
     * puede detectar recalculando. No van encriptados: son hashes, no
     * revelan contenido clínico. Ver security.HashChainUtil.
     */
    @Column(length = 64)
    private String hash;

    @Column(name = "hash_anterior", length = 64)
    private String hashAnterior;

    public ConsultaAuditLog() {
    }

    public ConsultaAuditLog(Consulta consulta, String campo, String valorAnterior, String valorNuevo,
            String modificadoPor) {
        this.consulta = consulta;
        this.campo = campo;
        this.valorAnterior = valorAnterior;
        this.valorNuevo = valorNuevo;
        this.modificadoPor = modificadoPor;
        // Truncado a segundos: MySQL DATETIME por defecto no guarda fracción
        // de segundo, así que sin esto el valor en memoria (con nanosegundos)
        // no coincidiría con el releído de la base al verificar la cadena de
        // integridad — rompería la verificación con datos totalmente legítimos.
        this.fechaCambio = LocalDateTime.now().truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Consulta getConsulta() {
        return consulta;
    }

    public void setConsulta(Consulta consulta) {
        this.consulta = consulta;
    }

    public String getCampo() {
        return campo;
    }

    public void setCampo(String campo) {
        this.campo = campo;
    }

    public String getValorAnterior() {
        return valorAnterior;
    }

    public void setValorAnterior(String valorAnterior) {
        this.valorAnterior = valorAnterior;
    }

    public String getValorNuevo() {
        return valorNuevo;
    }

    public void setValorNuevo(String valorNuevo) {
        this.valorNuevo = valorNuevo;
    }

    public LocalDateTime getFechaCambio() {
        return fechaCambio;
    }

    public void setFechaCambio(LocalDateTime fechaCambio) {
        this.fechaCambio = fechaCambio;
    }

    public String getModificadoPor() {
        return modificadoPor;
    }

    public void setModificadoPor(String modificadoPor) {
        this.modificadoPor = modificadoPor;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public String getHashAnterior() {
        return hashAnterior;
    }

    public void setHashAnterior(String hashAnterior) {
        this.hashAnterior = hashAnterior;
    }
}
