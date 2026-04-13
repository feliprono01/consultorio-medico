package com.consultorio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

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
    private String valorAnterior;

    @Column(columnDefinition = "TEXT")
    private String valorNuevo;

    @Column(nullable = false)
    private LocalDateTime fechaCambio;

    @Column(nullable = false)
    private String modificadoPor;

    public ConsultaAuditLog() {
    }

    public ConsultaAuditLog(Consulta consulta, String campo, String valorAnterior, String valorNuevo,
            String modificadoPor) {
        this.consulta = consulta;
        this.campo = campo;
        this.valorAnterior = valorAnterior;
        this.valorNuevo = valorNuevo;
        this.modificadoPor = modificadoPor;
        this.fechaCambio = LocalDateTime.now();
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
}
