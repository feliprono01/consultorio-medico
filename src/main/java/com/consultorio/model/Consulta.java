package com.consultorio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa una Consulta Médica (visita) en el sistema.
 * Hereda campos de auditoría y soft delete de la clase Auditable.
 * Cada consulta pertenece a un Paciente.
 */
@Entity
@Table(name = "consultas", indexes = {
        @Index(name = "idx_paciente_id", columnList = "paciente_id"),
        @Index(name = "idx_fecha_consulta", columnList = "fecha_consulta")
})
public class Consulta extends Auditable {

    /**
     * Relación Many-to-One con Paciente.
     * Una consulta pertenece a un único paciente.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(name = "fecha_consulta", nullable = false)
    private LocalDateTime fechaConsulta;

    @Column(nullable = false, length = 500)
    private String motivo;

    @Column(name = "motivo_consulta", nullable = false, length = 500)
    private String motivoConsulta;

    @Column(length = 1000)
    private String diagnostico;

    @Column(length = 2000)
    private String tratamiento;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(name = "estado_animo")
    private Integer estadoAnimo; // 1-10

    @Column(name = "calidad_sueno")
    private Integer calidadSueno; // 1-10

    @Column(name = "alimentacion")
    private Integer alimentacion; // 1-10

    @Column(name = "sociabilidad")
    private Integer sociabilidad; // 1-10

    @Column(name = "funcionalidad_laboral")
    private Integer funcionalidadLaboral; // 1-10

    @Column(name = "funcionalidad_social")
    private Integer funcionalidadSocial; // 1-10

    @Column(name = "funcionalidad_familiar")
    private Integer funcionalidadFamiliar; // 1-10

    @OneToOne(mappedBy = "consulta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private EvaluacionPsiquiatrica evaluacionPsiquiatrica;

    public Consulta() {
    }

    public Consulta(Long id, LocalDateTime createdAt, LocalDateTime updatedAt, Boolean active, Paciente paciente,
            LocalDateTime fechaConsulta, String motivo, String motivoConsulta, String diagnostico, String tratamiento,
            String notas, Integer estadoAnimo, Integer calidadSueno,
            Integer alimentacion, Integer sociabilidad, Integer funcionalidadLaboral,
            Integer funcionalidadSocial, Integer funcionalidadFamiliar,
            EvaluacionPsiquiatrica evaluacionPsiquiatrica) {
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.active = active;
        this.paciente = paciente;
        this.fechaConsulta = fechaConsulta;
        this.motivo = motivo;
        this.motivoConsulta = motivoConsulta;
        this.diagnostico = diagnostico;
        this.tratamiento = tratamiento;
        this.notas = notas;
        this.estadoAnimo = estadoAnimo;
        this.calidadSueno = calidadSueno;
        this.alimentacion = alimentacion;
        this.sociabilidad = sociabilidad;
        this.funcionalidadLaboral = funcionalidadLaboral;
        this.funcionalidadSocial = funcionalidadSocial;
        this.funcionalidadFamiliar = funcionalidadFamiliar;
        this.evaluacionPsiquiatrica = evaluacionPsiquiatrica;
    }

    public static ConsultaBuilder builder() {
        return new ConsultaBuilder();
    }

    public static class ConsultaBuilder {
        private Long id;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Boolean active = true;
        private Paciente paciente;
        private LocalDateTime fechaConsulta;
        private String motivo;
        private String motivoConsulta;
        private String diagnostico;
        private String tratamiento;
        private String notas;
        private Integer estadoAnimo;
        private Integer calidadSueno;
        private Integer alimentacion;
        private Integer sociabilidad;
        private Integer funcionalidadLaboral;
        private Integer funcionalidadSocial;
        private Integer funcionalidadFamiliar;
        private EvaluacionPsiquiatrica evaluacionPsiquiatrica;

        public ConsultaBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ConsultaBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ConsultaBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ConsultaBuilder active(Boolean active) {
            this.active = active;
            return this;
        }

        public ConsultaBuilder paciente(Paciente paciente) {
            this.paciente = paciente;
            return this;
        }

        public ConsultaBuilder fechaConsulta(LocalDateTime fechaConsulta) {
            this.fechaConsulta = fechaConsulta;
            return this;
        }

        public ConsultaBuilder motivo(String motivo) {
            this.motivo = motivo;
            return this;
        }

        public ConsultaBuilder motivoConsulta(String motivoConsulta) {
            this.motivoConsulta = motivoConsulta;
            return this;
        }

        public ConsultaBuilder diagnostico(String diagnostico) {
            this.diagnostico = diagnostico;
            return this;
        }

        public ConsultaBuilder tratamiento(String tratamiento) {
            this.tratamiento = tratamiento;
            return this;
        }

        public ConsultaBuilder notas(String notas) {
            this.notas = notas;
            return this;
        }

        public ConsultaBuilder estadoAnimo(Integer estadoAnimo) {
            this.estadoAnimo = estadoAnimo;
            return this;
        }

        public ConsultaBuilder calidadSueno(Integer calidadSueno) {
            this.calidadSueno = calidadSueno;
            return this;
        }

        public ConsultaBuilder alimentacion(Integer alimentacion) {
            this.alimentacion = alimentacion;
            return this;
        }

        public ConsultaBuilder sociabilidad(Integer sociabilidad) {
            this.sociabilidad = sociabilidad;
            return this;
        }

        public ConsultaBuilder funcionalidadLaboral(Integer funcionalidadLaboral) {
            this.funcionalidadLaboral = funcionalidadLaboral;
            return this;
        }

        public ConsultaBuilder funcionalidadSocial(Integer funcionalidadSocial) {
            this.funcionalidadSocial = funcionalidadSocial;
            return this;
        }

        public ConsultaBuilder funcionalidadFamiliar(Integer funcionalidadFamiliar) {
            this.funcionalidadFamiliar = funcionalidadFamiliar;
            return this;
        }

        public ConsultaBuilder evaluacionPsiquiatrica(EvaluacionPsiquiatrica evaluacionPsiquiatrica) {
            this.evaluacionPsiquiatrica = evaluacionPsiquiatrica;
            return this;
        }

        public Consulta build() {
            return new Consulta(id, createdAt, updatedAt, active, paciente, fechaConsulta, motivo, motivoConsulta,
                    diagnostico, tratamiento, notas, estadoAnimo, calidadSueno, alimentacion, sociabilidad,
                    funcionalidadLaboral, funcionalidadSocial, funcionalidadFamiliar, evaluacionPsiquiatrica);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public LocalDateTime getFechaConsulta() {
        return fechaConsulta;
    }

    public void setFechaConsulta(LocalDateTime fechaConsulta) {
        this.fechaConsulta = fechaConsulta;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getMotivoConsulta() {
        return motivoConsulta;
    }

    public void setMotivoConsulta(String motivoConsulta) {
        this.motivoConsulta = motivoConsulta;
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

    public EvaluacionPsiquiatrica getEvaluacionPsiquiatrica() {
        return evaluacionPsiquiatrica;
    }

    public void setEvaluacionPsiquiatrica(EvaluacionPsiquiatrica evaluacionPsiquiatrica) {
        this.evaluacionPsiquiatrica = evaluacionPsiquiatrica;
    }
}
