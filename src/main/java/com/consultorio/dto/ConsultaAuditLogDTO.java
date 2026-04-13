package com.consultorio.dto;

import java.time.LocalDateTime;

public class ConsultaAuditLogDTO {

    private Long id;
    private String campo;
    private String valorAnterior;
    private String valorNuevo;
    private LocalDateTime fechaCambio;
    private String modificadoPor;

    public ConsultaAuditLogDTO() {
    }

    public ConsultaAuditLogDTO(Long id, String campo, String valorAnterior, String valorNuevo,
            LocalDateTime fechaCambio, String modificadoPor) {
        this.id = id;
        this.campo = campo;
        this.valorAnterior = valorAnterior;
        this.valorNuevo = valorNuevo;
        this.fechaCambio = fechaCambio;
        this.modificadoPor = modificadoPor;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
