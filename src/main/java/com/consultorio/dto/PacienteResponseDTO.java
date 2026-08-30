package com.consultorio.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO para enviar datos de un Paciente al cliente.
 * Incluye campos de auditoría para trazabilidad.
 */
public class PacienteResponseDTO {

    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;

    private LocalDate fechaNacimiento;
    private String ciudad;
    private String direccion;
    private String sexo;
    private String ocupacion;
    private String estadoCivil;
    private String escolaridad;
    private String datosPadres;
    private String datosHijos;
    private String datosHermanos;
    private Integer edad;

    // --- Datos administrativos exigidos por la guía de HCE (Ley 26.529 / 27.706) ---
    private String cuilCuit;
    private String obraSocial;
    private String numeroAfiliado;
    private String contactoEmergenciaNombre;
    private String contactoEmergenciaTelefono;

    // Campos de auditoría
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean active;
    private Long version;

    /**
     * Indica si el paciente firmó el Consentimiento Informado (Ley 25.326).
     */
    private Boolean consentimientoInformado;

    /**
     * Fecha en que el paciente otorgó el consentimiento informado.
     */
    private LocalDate fechaConsentimiento;

    /**
     * Campo calculado: nombre completo
     */
    private String nombreCompleto;

    private HistoriaPsiquiatricaDTO historiaPsiquiatrica;

    public PacienteResponseDTO() {
    }

    public PacienteResponseDTO(Long id, String nombre, String apellido, String dni, String email, String telefono,
            LocalDate fechaNacimiento, String ciudad, String direccion, String sexo,
            String ocupacion, String estadoCivil, String escolaridad,
            String datosPadres, String datosHijos, String datosHermanos,
            String cuilCuit, String obraSocial, String numeroAfiliado,
            String contactoEmergenciaNombre, String contactoEmergenciaTelefono,
            LocalDateTime createdAt, LocalDateTime updatedAt, Boolean active,
            String nombreCompleto, HistoriaPsiquiatricaDTO historiaPsiquiatrica, Long version,
            Boolean consentimientoInformado, LocalDate fechaConsentimiento) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.dni = dni;
        this.email = email;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.ciudad = ciudad;
        this.direccion = direccion;
        this.sexo = sexo;
        this.ocupacion = ocupacion;
        this.estadoCivil = estadoCivil;
        this.escolaridad = escolaridad;
        this.datosPadres = datosPadres;
        this.datosHijos = datosHijos;
        this.datosHermanos = datosHermanos;
        this.cuilCuit = cuilCuit;
        this.obraSocial = obraSocial;
        this.numeroAfiliado = numeroAfiliado;
        this.contactoEmergenciaNombre = contactoEmergenciaNombre;
        this.contactoEmergenciaTelefono = contactoEmergenciaTelefono;
        if (fechaNacimiento != null) {
            this.edad = java.time.Period.between(fechaNacimiento, java.time.LocalDate.now()).getYears();
        }
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.active = active;
        this.nombreCompleto = nombreCompleto;
        this.historiaPsiquiatrica = historiaPsiquiatrica;
        this.version = version;
        this.consentimientoInformado = consentimientoInformado;
        this.fechaConsentimiento = fechaConsentimiento;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
        if (fechaNacimiento != null) {
            this.edad = java.time.Period.between(fechaNacimiento, java.time.LocalDate.now()).getYears();
        } else {
            this.edad = null;
        }
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getSexo() {
        return sexo;
    }

    public void setSexo(String sexo) {
        this.sexo = sexo;
    }

    public String getOcupacion() {
        return ocupacion;
    }

    public void setOcupacion(String ocupacion) {
        this.ocupacion = ocupacion;
    }

    public String getEstadoCivil() {
        return estadoCivil;
    }

    public void setEstadoCivil(String estadoCivil) {
        this.estadoCivil = estadoCivil;
    }

    public String getEscolaridad() {
        return escolaridad;
    }

    public void setEscolaridad(String escolaridad) {
        this.escolaridad = escolaridad;
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

    public String getCuilCuit() {
        return cuilCuit;
    }

    public void setCuilCuit(String cuilCuit) {
        this.cuilCuit = cuilCuit;
    }

    public String getObraSocial() {
        return obraSocial;
    }

    public void setObraSocial(String obraSocial) {
        this.obraSocial = obraSocial;
    }

    public String getNumeroAfiliado() {
        return numeroAfiliado;
    }

    public void setNumeroAfiliado(String numeroAfiliado) {
        this.numeroAfiliado = numeroAfiliado;
    }

    public String getContactoEmergenciaNombre() {
        return contactoEmergenciaNombre;
    }

    public void setContactoEmergenciaNombre(String contactoEmergenciaNombre) {
        this.contactoEmergenciaNombre = contactoEmergenciaNombre;
    }

    public String getContactoEmergenciaTelefono() {
        return contactoEmergenciaTelefono;
    }

    public void setContactoEmergenciaTelefono(String contactoEmergenciaTelefono) {
        this.contactoEmergenciaTelefono = contactoEmergenciaTelefono;
    }

    public Integer getEdad() {
        return edad;
    }

    public void setEdad(Integer edad) {
        this.edad = edad;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public HistoriaPsiquiatricaDTO getHistoriaPsiquiatrica() {
        return historiaPsiquiatrica;
    }

    public void setHistoriaPsiquiatrica(HistoriaPsiquiatricaDTO historiaPsiquiatrica) {
        this.historiaPsiquiatrica = historiaPsiquiatrica;
    }

    public Boolean getConsentimientoInformado() {
        return consentimientoInformado;
    }

    public void setConsentimientoInformado(Boolean consentimientoInformado) {
        this.consentimientoInformado = consentimientoInformado;
    }

    public LocalDate getFechaConsentimiento() {
        return fechaConsentimiento;
    }

    public void setFechaConsentimiento(LocalDate fechaConsentimiento) {
        this.fechaConsentimiento = fechaConsentimiento;
    }

    public static PacienteResponseDTOBuilder builder() {
        return new PacienteResponseDTOBuilder();
    }

    public static class PacienteResponseDTOBuilder {
        private Long id;
        private String nombre;
        private String apellido;
        private String dni;
        private String email;
        private String telefono;
        private LocalDate fechaNacimiento;
        private String ciudad;
        private String direccion;
        private String sexo;
        private String ocupacion;
        private String estadoCivil;
        private String escolaridad;
        private String datosPadres;
        private String datosHijos;
        private String datosHermanos;
        private String cuilCuit;
        private String obraSocial;
        private String numeroAfiliado;
        private String contactoEmergenciaNombre;
        private String contactoEmergenciaTelefono;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Boolean active;
        private String nombreCompleto;
        private HistoriaPsiquiatricaDTO historiaPsiquiatrica;
        private Long version;
        private Boolean consentimientoInformado;
        private LocalDate fechaConsentimiento;

        public PacienteResponseDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PacienteResponseDTOBuilder nombre(String nombre) {
            this.nombre = nombre;
            return this;
        }

        public PacienteResponseDTOBuilder apellido(String apellido) {
            this.apellido = apellido;
            return this;
        }

        public PacienteResponseDTOBuilder dni(String dni) {
            this.dni = dni;
            return this;
        }

        public PacienteResponseDTOBuilder email(String email) {
            this.email = email;
            return this;
        }

        public PacienteResponseDTOBuilder telefono(String telefono) {
            this.telefono = telefono;
            return this;
        }

        public PacienteResponseDTOBuilder fechaNacimiento(LocalDate fechaNacimiento) {
            this.fechaNacimiento = fechaNacimiento;
            return this;
        }

        public PacienteResponseDTOBuilder ciudad(String ciudad) {
            this.ciudad = ciudad;
            return this;
        }

        public PacienteResponseDTOBuilder direccion(String direccion) {
            this.direccion = direccion;
            return this;
        }

        public PacienteResponseDTOBuilder sexo(String sexo) {
            this.sexo = sexo;
            return this;
        }

        public PacienteResponseDTOBuilder ocupacion(String ocupacion) {
            this.ocupacion = ocupacion;
            return this;
        }

        public PacienteResponseDTOBuilder estadoCivil(String estadoCivil) {
            this.estadoCivil = estadoCivil;
            return this;
        }

        public PacienteResponseDTOBuilder escolaridad(String escolaridad) {
            this.escolaridad = escolaridad;
            return this;
        }

        public PacienteResponseDTOBuilder datosPadres(String datosPadres) {
            this.datosPadres = datosPadres;
            return this;
        }

        public PacienteResponseDTOBuilder datosHijos(String datosHijos) {
            this.datosHijos = datosHijos;
            return this;
        }

        public PacienteResponseDTOBuilder datosHermanos(String datosHermanos) {
            this.datosHermanos = datosHermanos;
            return this;
        }

        public PacienteResponseDTOBuilder cuilCuit(String cuilCuit) {
            this.cuilCuit = cuilCuit;
            return this;
        }

        public PacienteResponseDTOBuilder obraSocial(String obraSocial) {
            this.obraSocial = obraSocial;
            return this;
        }

        public PacienteResponseDTOBuilder numeroAfiliado(String numeroAfiliado) {
            this.numeroAfiliado = numeroAfiliado;
            return this;
        }

        public PacienteResponseDTOBuilder contactoEmergenciaNombre(String contactoEmergenciaNombre) {
            this.contactoEmergenciaNombre = contactoEmergenciaNombre;
            return this;
        }

        public PacienteResponseDTOBuilder contactoEmergenciaTelefono(String contactoEmergenciaTelefono) {
            this.contactoEmergenciaTelefono = contactoEmergenciaTelefono;
            return this;
        }

        public PacienteResponseDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PacienteResponseDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public PacienteResponseDTOBuilder active(Boolean active) {
            this.active = active;
            return this;
        }

        public PacienteResponseDTOBuilder nombreCompleto(String nombreCompleto) {
            this.nombreCompleto = nombreCompleto;
            return this;
        }

        public PacienteResponseDTOBuilder historiaPsiquiatrica(HistoriaPsiquiatricaDTO historiaPsiquiatrica) {
            this.historiaPsiquiatrica = historiaPsiquiatrica;
            return this;
        }

        public PacienteResponseDTOBuilder version(Long version) {
            this.version = version;
            return this;
        }

        public PacienteResponseDTOBuilder consentimientoInformado(Boolean consentimientoInformado) {
            this.consentimientoInformado = consentimientoInformado;
            return this;
        }

        public PacienteResponseDTOBuilder fechaConsentimiento(LocalDate fechaConsentimiento) {
            this.fechaConsentimiento = fechaConsentimiento;
            return this;
        }

        public PacienteResponseDTO build() {
            return new PacienteResponseDTO(id, nombre, apellido, dni, email, telefono, fechaNacimiento,
                    ciudad, direccion, sexo, ocupacion, estadoCivil, escolaridad, datosPadres, datosHijos,
                    datosHermanos, cuilCuit, obraSocial, numeroAfiliado, contactoEmergenciaNombre,
                    contactoEmergenciaTelefono, createdAt, updatedAt, active, nombreCompleto,
                    historiaPsiquiatrica, version, consentimientoInformado, fechaConsentimiento);
        }
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}
