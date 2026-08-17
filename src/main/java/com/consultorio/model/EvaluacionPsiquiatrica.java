package com.consultorio.model;

import jakarta.persistence.*;
import com.consultorio.security.AttributeEncryptor;

@Entity
@Table(name = "evaluaciones_psiquiatricas")
public class EvaluacionPsiquiatrica extends Auditable {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consulta_id", nullable = false, unique = true)
    private Consulta consulta;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String apariencia;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String conducta;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String lenguaje;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String animo;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String afecto;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String pensamiento; // Curso y contenido

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String sensopercepcion;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String juicio;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String memoria;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String atencion;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String riesgoSuicida;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String riesgoHomicida;

    // Nuevos campos - Examen Mental
    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String conciencia;

    // Nuevos campos - Riesgos
    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String riesgoPropio;

    // Nuevos campos - Diagnóstico Multiaxial
    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String eje1;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String eje2;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String eje3;

    // Nuevos campos - Tratamiento
    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String adherenciaTratamiento;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String efectosAdversos;

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

    public String getApariencia() {
        return apariencia;
    }

    public void setApariencia(String apariencia) {
        this.apariencia = apariencia;
    }

    public String getConducta() {
        return conducta;
    }

    public void setConducta(String conducta) {
        this.conducta = conducta;
    }

    public String getLenguaje() {
        return lenguaje;
    }

    public void setLenguaje(String lenguaje) {
        this.lenguaje = lenguaje;
    }

    public String getAnimo() {
        return animo;
    }

    public void setAnimo(String animo) {
        this.animo = animo;
    }

    public String getAfecto() {
        return afecto;
    }

    public void setAfecto(String afecto) {
        this.afecto = afecto;
    }

    public String getPensamiento() {
        return pensamiento;
    }

    public void setPensamiento(String pensamiento) {
        this.pensamiento = pensamiento;
    }

    public String getSensopercepcion() {
        return sensopercepcion;
    }

    public void setSensopercepcion(String sensopercepcion) {
        this.sensopercepcion = sensopercepcion;
    }

    public String getJuicio() {
        return juicio;
    }

    public void setJuicio(String juicio) {
        this.juicio = juicio;
    }

    public String getMemoria() {
        return memoria;
    }

    public void setMemoria(String memoria) {
        this.memoria = memoria;
    }

    public String getAtencion() {
        return atencion;
    }

    public void setAtencion(String atencion) {
        this.atencion = atencion;
    }

    public String getRiesgoSuicida() {
        return riesgoSuicida;
    }

    public void setRiesgoSuicida(String riesgoSuicida) {
        this.riesgoSuicida = riesgoSuicida;
    }

    public String getRiesgoHomicida() {
        return riesgoHomicida;
    }

    public void setRiesgoHomicida(String riesgoHomicida) {
        this.riesgoHomicida = riesgoHomicida;
    }

    public String getConciencia() {
        return conciencia;
    }

    public void setConciencia(String conciencia) {
        this.conciencia = conciencia;
    }

    public String getRiesgoPropio() {
        return riesgoPropio;
    }

    public void setRiesgoPropio(String riesgoPropio) {
        this.riesgoPropio = riesgoPropio;
    }

    public String getEje1() {
        return eje1;
    }

    public void setEje1(String eje1) {
        this.eje1 = eje1;
    }

    public String getEje2() {
        return eje2;
    }

    public void setEje2(String eje2) {
        this.eje2 = eje2;
    }

    public String getEje3() {
        return eje3;
    }

    public void setEje3(String eje3) {
        this.eje3 = eje3;
    }

    public String getAdherenciaTratamiento() {
        return adherenciaTratamiento;
    }

    public void setAdherenciaTratamiento(String adherenciaTratamiento) {
        this.adherenciaTratamiento = adherenciaTratamiento;
    }

    public String getEfectosAdversos() {
        return efectosAdversos;
    }

    public void setEfectosAdversos(String efectosAdversos) {
        this.efectosAdversos = efectosAdversos;
    }

}
