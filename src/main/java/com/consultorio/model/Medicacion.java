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

    public Medicacion() {
    }

    public Medicacion(Consulta consulta, String farmaco, String dosis, String frecuencia) {
        this.consulta = consulta;
        this.farmaco = farmaco;
        this.dosis = dosis;
        this.frecuencia = frecuencia;
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
}
