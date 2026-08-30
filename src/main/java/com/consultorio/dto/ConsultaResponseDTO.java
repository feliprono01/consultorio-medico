package com.consultorio.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ConsultaResponseDTO {

    private Long id;
    private Long pacienteId;
    private String nombrePaciente;
    private String apellidoPaciente;
    private String dniPaciente;
    private LocalDateTime fechaConsulta;
    private String motivo;
    private String diagnostico;
    private String diagnosticoCie10;
    private Long correccionDeId;
    /** true si esta fila fue superada por una corrección más nueva (no es la vigente). */
    private Boolean corregida;
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
    private Long version;

    /** Se completa aparte en el service (no viene del mapper de Consulta, es una tabla propia). */
    private List<MedicacionDTO> medicaciones;

    public List<MedicacionDTO> getMedicaciones() {
        return medicaciones;
    }

    public void setMedicaciones(List<MedicacionDTO> medicaciones) {
        this.medicaciones = medicaciones;
    }

    public ConsultaResponseDTO() {
    }

    public ConsultaResponseDTO(Long id, Long pacienteId, String nombrePaciente, String apellidoPaciente,
            String dniPaciente, LocalDateTime fechaConsulta, String motivo, String diagnostico, String diagnosticoCie10, String tratamiento,
            String notas, Integer estadoAnimo, Integer calidadSueno,
            Integer alimentacion, Integer sociabilidad, Integer funcionalidadLaboral,
            Integer funcionalidadSocial, Integer funcionalidadFamiliar,
            EvaluacionPsiquiatricaDTO evaluacionPsiquiatrica, Long version, Long correccionDeId) {
        this.id = id;
        this.pacienteId = pacienteId;
        this.nombrePaciente = nombrePaciente;
        this.apellidoPaciente = apellidoPaciente;
        this.dniPaciente = dniPaciente;
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
        this.version = version;
        this.correccionDeId = correccionDeId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPacienteId() {
        return pacienteId;
    }

    public void setPacienteId(Long pacienteId) {
        this.pacienteId = pacienteId;
    }

    public String getNombrePaciente() {
        return nombrePaciente;
    }

    public void setNombrePaciente(String nombrePaciente) {
        this.nombrePaciente = nombrePaciente;
    }

    public String getApellidoPaciente() {
        return apellidoPaciente;
    }

    public void setApellidoPaciente(String apellidoPaciente) {
        this.apellidoPaciente = apellidoPaciente;
    }

    public String getDniPaciente() {
        return dniPaciente;
    }

    public void setDniPaciente(String dniPaciente) {
        this.dniPaciente = dniPaciente;
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

    public Boolean getCorregida() {
        return corregida;
    }

    public void setCorregida(Boolean corregida) {
        this.corregida = corregida;
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

    public static ConsultaResponseDTOBuilder builder() {
        return new ConsultaResponseDTOBuilder();
    }

    public static class ConsultaResponseDTOBuilder {
        private Long id;
        private Long pacienteId;
        private String nombrePaciente;
        private String apellidoPaciente;
        private String dniPaciente;
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
        private EvaluacionPsiquiatricaDTO evaluacionPsiquiatrica;
        private Long version;
        private Long correccionDeId;

        public ConsultaResponseDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ConsultaResponseDTOBuilder pacienteId(Long pacienteId) {
            this.pacienteId = pacienteId;
            return this;
        }

        public ConsultaResponseDTOBuilder nombrePaciente(String nombrePaciente) {
            this.nombrePaciente = nombrePaciente;
            return this;
        }

        public ConsultaResponseDTOBuilder apellidoPaciente(String apellidoPaciente) {
            this.apellidoPaciente = apellidoPaciente;
            return this;
        }

        public ConsultaResponseDTOBuilder dniPaciente(String dniPaciente) {
            this.dniPaciente = dniPaciente;
            return this;
        }

        public ConsultaResponseDTOBuilder fechaConsulta(LocalDateTime fechaConsulta) {
            this.fechaConsulta = fechaConsulta;
            return this;
        }

        public ConsultaResponseDTOBuilder motivo(String motivo) {
            this.motivo = motivo;
            return this;
        }

        public ConsultaResponseDTOBuilder diagnostico(String diagnostico) {
            this.diagnostico = diagnostico;
            return this;
        }

        public ConsultaResponseDTOBuilder diagnosticoCie10(String diagnosticoCie10) {
            this.diagnosticoCie10 = diagnosticoCie10;
            return this;
        }

        public ConsultaResponseDTOBuilder tratamiento(String tratamiento) {
            this.tratamiento = tratamiento;
            return this;
        }

        public ConsultaResponseDTOBuilder notas(String notas) {
            this.notas = notas;
            return this;
        }

        public ConsultaResponseDTOBuilder estadoAnimo(Integer estadoAnimo) {
            this.estadoAnimo = estadoAnimo;
            return this;
        }

        public ConsultaResponseDTOBuilder calidadSueno(Integer calidadSueno) {
            this.calidadSueno = calidadSueno;
            return this;
        }

        public ConsultaResponseDTOBuilder alimentacion(Integer alimentacion) {
            this.alimentacion = alimentacion;
            return this;
        }

        public ConsultaResponseDTOBuilder sociabilidad(Integer sociabilidad) {
            this.sociabilidad = sociabilidad;
            return this;
        }

        public ConsultaResponseDTOBuilder funcionalidadLaboral(Integer funcionalidadLaboral) {
            this.funcionalidadLaboral = funcionalidadLaboral;
            return this;
        }

        public ConsultaResponseDTOBuilder funcionalidadSocial(Integer funcionalidadSocial) {
            this.funcionalidadSocial = funcionalidadSocial;
            return this;
        }

        public ConsultaResponseDTOBuilder funcionalidadFamiliar(Integer funcionalidadFamiliar) {
            this.funcionalidadFamiliar = funcionalidadFamiliar;
            return this;
        }

        public ConsultaResponseDTOBuilder evaluacionPsiquiatrica(EvaluacionPsiquiatricaDTO evaluacionPsiquiatrica) {
            this.evaluacionPsiquiatrica = evaluacionPsiquiatrica;
            return this;
        }

        public ConsultaResponseDTOBuilder version(Long version) {
            this.version = version;
            return this;
        }

        public ConsultaResponseDTOBuilder correccionDeId(Long correccionDeId) {
            this.correccionDeId = correccionDeId;
            return this;
        }

        public ConsultaResponseDTO build() {
            return new ConsultaResponseDTO(id, pacienteId, nombrePaciente, apellidoPaciente, dniPaciente, fechaConsulta,
                    motivo, diagnostico, diagnosticoCie10, tratamiento, notas, estadoAnimo, calidadSueno, alimentacion,
                    sociabilidad,
                    funcionalidadLaboral, funcionalidadSocial, funcionalidadFamiliar, evaluacionPsiquiatrica, version, correccionDeId);
        }
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
