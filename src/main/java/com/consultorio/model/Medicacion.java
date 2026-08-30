package com.consultorio.model;

import jakarta.persistence.*;
import com.consultorio.security.AttributeEncryptor;

/**
 * Una línea de medicación estructurada (fármaco/dosis/frecuencia) prescripta
 * en una consulta. Complementa el campo de texto libre "tratamiento" de
 * Consulta — ese sigue existiendo para indicaciones generales, esto es para
 * que la prescripción de cada fármaco quede clara e inequívoca.
 *
 * El ciclo de vida es simple: al editar una consulta se reemplaza toda la
 * lista de medicaciones (se borran las viejas, se insertan las nuevas) — no
 * hace falta un historial propio de esta tabla porque los cambios ya quedan
 * registrados en ConsultaAuditLog como un solo campo "Medicación
 * (estructurada)" (ver ConsultaService).
 */
@Entity
@Table(name = "medicaciones", indexes = {
        @Index(name = "idx_medicacion_consulta_id", columnList = "consulta_id")
})
public class Medicacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consulta_id", nullable = false)
    private Consulta consulta;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String farmaco;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String dosis;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String frecuencia;

    /** Vía de administración (oral, sublingual, intramuscular, etc.) — exigido por la guía de HCE. */
    @Column(name = "via_administracion", columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String viaAdministracion;

    /** Duración prevista del tratamiento (ej. "3 meses", "hasta reevaluación"). */
    @Column(name = "duracion_prevista", columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String duracionPrevista;

    public Medicacion() {
    }

    public Medicacion(Consulta consulta, String farmaco, String dosis, String frecuencia,
            String viaAdministracion, String duracionPrevista) {
        this.consulta = consulta;
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

    public Consulta getConsulta() {
        return consulta;
    }

    public void setConsulta(Consulta consulta) {
        this.consulta = consulta;
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
