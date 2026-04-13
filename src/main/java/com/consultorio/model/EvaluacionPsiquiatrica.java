package com.consultorio.model;

import jakarta.persistence.*;

@Entity
@Table(name = "evaluaciones_psiquiatricas")
public class EvaluacionPsiquiatrica extends Auditable {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consulta_id", nullable = false, unique = true)
    private Consulta consulta;

    @Column(length = 500)
    private String apariencia;

    @Column(length = 500)
    private String conducta;

    @Column(length = 500)
    private String lenguaje;

    @Column(length = 500)
    private String animo;

    @Column(length = 500)
    private String afecto;

    @Column(length = 500)
    private String pensamiento; // Curso y contenido

    @Column(length = 500)
    private String sensopercepcion;

    @Column(length = 500)
    private String juicio;

    @Column(length = 500)
    private String memoria;

    @Column(length = 500)
    private String atencion;

    @Column(columnDefinition = "TEXT")
    private String riesgoSuicida;

    @Column(columnDefinition = "TEXT")
    private String riesgoHomicida;

    // Nuevos campos - Examen Mental
    @Column(length = 500)
    private String conciencia;

    // Nuevos campos - Riesgos
    @Column(columnDefinition = "TEXT")
    private String riesgoPropio;

    // Nuevos campos - Diagnóstico Multiaxial
    @Column(length = 500)
    private String eje1;

    @Column(length = 500)
    private String eje2;

    @Column(length = 500)
    private String eje3;

    // Nuevos campos - Tratamiento
    @Column(length = 500)
    private String adherenciaTratamiento;

    @Column(columnDefinition = "TEXT")
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
