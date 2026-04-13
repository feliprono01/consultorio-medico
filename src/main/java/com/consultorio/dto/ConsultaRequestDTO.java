package com.consultorio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ConsultaRequestDTO {

    @NotNull(message = "El ID del paciente es obligatorio")
    private Long pacienteId;

    @NotBlank(message = "El motivo de la consulta es obligatorio")
    private String motivo;

    private String diagnostico;

    @Size(max = 2000, message = "El tratamiento no debe exceder los 2000 caracteres")
    private String tratamiento;

    private String notas;

    private Integer estadoAnimo;
    private Integer calidadSueno;
    private Integer alimentacion;
    private Integer sociabilidad;
    private Integer funcionalidadLaboral;
    private Integer funcionalidadSocial;
    private Integer funcionalidadFamiliar;

    private EvaluacionPsiquiatricaDTO evaluacionPsiquiatrica;

    public Long getPacienteId() {
        return pacienteId;
    }

    public void setPacienteId(Long pacienteId) {
        this.pacienteId = pacienteId;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getTratamiento() {
        return tratamiento;
    }

    public void setTratamiento(String tratamiento) {
        this.tratamiento = tratamiento;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public Integer getEstadoAnimo() {
        return estadoAnimo;
    }

    public void setEstadoAnimo(Integer estadoAnimo) {
        this.estadoAnimo = estadoAnimo;
    }

    public Integer getCalidadSueno() {
        return calidadSueno;
    }

    public void setCalidadSueno(Integer calidadSueno) {
        this.calidadSueno = calidadSueno;
    }

    public Integer getAlimentacion() {
        return alimentacion;
    }

    public void setAlimentacion(Integer alimentacion) {
        this.alimentacion = alimentacion;
    }

    public Integer getSociabilidad() {
        return sociabilidad;
    }

    public void setSociabilidad(Integer sociabilidad) {
        this.sociabilidad = sociabilidad;
    }

    public Integer getFuncionalidadLaboral() {
        return funcionalidadLaboral;
    }

    public void setFuncionalidadLaboral(Integer funcionalidadLaboral) {
        this.funcionalidadLaboral = funcionalidadLaboral;
    }

    public Integer getFuncionalidadSocial() {
        return funcionalidadSocial;
    }

    public void setFuncionalidadSocial(Integer funcionalidadSocial) {
        this.funcionalidadSocial = funcionalidadSocial;
    }

    public Integer getFuncionalidadFamiliar() {
        return funcionalidadFamiliar;
    }

    public void setFuncionalidadFamiliar(Integer funcionalidadFamiliar) {
        this.funcionalidadFamiliar = funcionalidadFamiliar;
    }

    public EvaluacionPsiquiatricaDTO getEvaluacionPsiquiatrica() {
        return evaluacionPsiquiatrica;
    }

    public void setEvaluacionPsiquiatrica(EvaluacionPsiquiatricaDTO evaluacionPsiquiatrica) {
        this.evaluacionPsiquiatrica = evaluacionPsiquiatrica;
    }
}
