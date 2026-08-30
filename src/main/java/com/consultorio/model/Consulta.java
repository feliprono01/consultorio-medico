package com.consultorio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.consultorio.security.AttributeEncryptor;


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

    @Column(nullable = false, columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String motivo;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String diagnostico;

    /** Código CIE-10/CIE-11 del diagnóstico, junto al texto libre de arriba. */
    @Column(name = "diagnostico_cie10", length = 20)
    private String diagnosticoCie10;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String tratamiento;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
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

    /**
     * Modelo append-only (Ley 26.657 / guía de HCE): una vez creada, una
     * Consulta nunca se vuelve a modificar. Corregirla arma una fila NUEVA
     * (con la misma fecha_consulta) que apunta acá con este campo — la fila
     * original queda intacta para siempre. Sin FK física (igual criterio que
     * ConsultaAuditLog.pacienteId) para no complicar cascadas de borrado.
     * Null = esta fila es un original o el eslabón más viejo de su cadena.
     * Ver ConsultaService.corregirConsulta / ConsultaRepository.
     */
    @Column(name = "correccion_de_id")
    private Long correccionDeId;

    public Consulta() {
    }

    public Consulta(Long id, LocalDateTime createdAt, LocalDateTime updatedAt, Boolean active, Paciente paciente,
            LocalDateTime fechaConsulta, String motivo, String diagnostico, String diagnosticoCie10, String tratamiento,
            String notas, Integer estadoAnimo, Integer calidadSueno,
            Integer alimentacion, Integer sociabilidad, Integer funcionalidadLaboral,
            Integer funcionalidadSocial, Integer funcionalidadFamiliar,
            EvaluacionPsiquiatrica evaluacionPsiquiatrica, Long correccionDeId) {
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.active = active;
        this.paciente = paciente;
        this.fechaConsulta = fechaConsulta;
        this.motivo = motivo;
        this.diagnostico = diagnostico;
        this.diagnosticoCie10 = diagnosticoCie10;
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
        this.correccionDeId = correccionDeId;
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
        private String diagnostico;
        private String diagnosticoCie10;
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
        private Long correccionDeId;

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

        public ConsultaBuilder diagnostico(String diagnostico) {
            this.diagnostico = diagnostico;
            return this;
        }

        public ConsultaBuilder diagnosticoCie10(String diagnosticoCie10) {
            this.diagnosticoCie10 = diagnosticoCie10;
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

        public ConsultaBuilder correccionDeId(Long correccionDeId) {
            this.correccionDeId = correccionDeId;
            return this;
        }

        public Consulta build() {
            return new Consulta(id, createdAt, updatedAt, active, paciente, fechaConsulta, motivo,
                    diagnostico, diagnosticoCie10, tratamiento, notas, estadoAnimo, calidadSueno, alimentacion, sociabilidad,
                    funcionalidadLaboral, funcionalidadSocial, funcionalidadFamiliar, evaluacionPsiquiatrica, correccionDeId);
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

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getDiagnosticoCie10() {
        return diagnosticoCie10;
    }

    public void setDiagnosticoCie10(String diagnosticoCie10) {
        this.diagnosticoCie10 = diagnosticoCie10;
    }

    public Long getCorreccionDeId() {
        return correccionDeId;
    }

    public void setCorreccionDeId(Long correccionDeId) {
        this.correccionDeId = correccionDeId;
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
