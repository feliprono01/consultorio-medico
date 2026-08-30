package com.consultorio.dto;

/**
 * Una línea de medicación estructurada dentro del tratamiento de una
 * consulta: fármaco, dosis y frecuencia por separado, en vez de un solo
 * texto libre — pensado para que la prescripción quede clara e inequívoca.
 */
public class MedicacionDTO {

    private Long id;
    private String farmaco;
    private String dosis;
    private String frecuencia;
    private String viaAdministracion;
    private String duracionPrevista;

    public MedicacionDTO() {
    }

    public MedicacionDTO(Long id, String farmaco, String dosis, String frecuencia,
            String viaAdministracion, String duracionPrevista) {
        this.id = id;
        this.farmaco = farmaco;
        this.dosis = dosis;
        this.frecuencia = frecuencia;
        this.viaAdministracion = viaAdministracion;
        this.duracionPrevista = duracionPrevista;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFarmaco() {
        return farmaco;
    }

    public void setFarmaco(String farmaco) {
        this.farmaco = farmaco;
    }

    public String getDosis() {
        return dosis;
    }

    public void setDosis(String dosis) {
        this.dosis = dosis;
    }

    public String getFrecuencia() {
        return frecuencia;
    }

    public void setFrecuencia(String frecuencia) {
        this.frecuencia = frecuencia;
    }

    public String getViaAdministracion() {
        return viaAdministracion;
    }

    public void setViaAdministracion(String viaAdministracion) {
        this.viaAdministracion = viaAdministracion;
    }

    public String getDuracionPrevista() {
        return duracionPrevista;
    }

    public void setDuracionPrevista(String duracionPrevista) {
        this.duracionPrevista = duracionPrevista;
    }
}
