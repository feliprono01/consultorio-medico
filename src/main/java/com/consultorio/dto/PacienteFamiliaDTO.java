package com.consultorio.dto;

/**
 * DTO chico para actualizar solo la composición familiar de un paciente
 * (datosPadres/datosHijos/datosHermanos), de forma independiente al resto
 * de la ficha. `version` es la del propio Paciente — estos campos viven en
 * la misma fila, no en una entidad aparte como la Historia Psiquiátrica.
 */
public class PacienteFamiliaDTO {

    private String datosPadres;
    private String datosHijos;
    private String datosHermanos;
    private Long version;

    public PacienteFamiliaDTO() {
    }

    public String getDatosPadres() {
        return datosPadres;
    }

    public void setDatosPadres(String datosPadres) {
        this.datosPadres = datosPadres;
    }

    public String getDatosHijos() {
        return datosHijos;
    }

    public void setDatosHijos(String datosHijos) {
        this.datosHijos = datosHijos;
    }

    public String getDatosHermanos() {
        return datosHermanos;
    }

    public void setDatosHermanos(String datosHermanos) {
        this.datosHermanos = datosHermanos;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
