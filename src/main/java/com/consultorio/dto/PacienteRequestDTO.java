package com.consultorio.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * DTO para recibir datos de creación o actualización de un Paciente.
 * Incluye validaciones de Bean Validation.
 */
public class PacienteRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
    private String apellido;

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "^[0-9]{7,20}$", message = "El DNI debe contener solo números y tener entre 7 y 20 dígitos")
    private String dni;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe tener un formato válido")
    @Size(max = 150, message = "El email no puede exceder 150 caracteres")
    private String email;

    @Pattern(regexp = "^[0-9+\\-\\s()]{0,20}$", message = "El teléfono debe contener solo números, espacios y los caracteres: + - ( )")
    private String telefono;

    @Past(message = "La fecha de nacimiento debe ser anterior a la fecha actual")

    private LocalDate fechaNacimiento;

    @Size(max = 100, message = "La ciudad no puede exceder 100 caracteres")
    private String ciudad;

    @Size(max = 200, message = "La dirección no puede exceder 200 caracteres")
    private String direccion;

    private String sexo;
    private String ocupacion;
    private String estadoCivil;
    private String escolaridad;
    private String datosPadres;
    private String datosHijos;
    private String datosHermanos;

    public PacienteRequestDTO() {
    }

    public PacienteRequestDTO(String nombre, String apellido, String dni, String email, String telefono,
            LocalDate fechaNacimiento, String ciudad, String direccion, String sexo,
            String ocupacion, String estadoCivil, String escolaridad,
            String datosPadres, String datosHijos, String datosHermanos) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.dni = dni;
        this.email = email;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.ciudad = ciudad;
        this.direccion = direccion;
        this.sexo = sexo;
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

    public static PacienteRequestDTOBuilder builder() {
        return new PacienteRequestDTOBuilder();
    }

    public static class PacienteRequestDTOBuilder {
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

        public PacienteRequestDTOBuilder nombre(String nombre) {
            this.nombre = nombre;
            return this;
        }

        public PacienteRequestDTOBuilder apellido(String apellido) {
            this.apellido = apellido;
            return this;
        }

        public PacienteRequestDTOBuilder dni(String dni) {
            this.dni = dni;
            return this;
        }

        public PacienteRequestDTOBuilder email(String email) {
            this.email = email;
            return this;
        }

        public PacienteRequestDTOBuilder telefono(String telefono) {
            this.telefono = telefono;
            return this;
        }

        public PacienteRequestDTOBuilder fechaNacimiento(LocalDate fechaNacimiento) {
            this.fechaNacimiento = fechaNacimiento;
            return this;
        }

        public PacienteRequestDTOBuilder ciudad(String ciudad) {
            this.ciudad = ciudad;
            return this;
        }

        public PacienteRequestDTOBuilder direccion(String direccion) {
            this.direccion = direccion;
            return this;
        }

        public PacienteRequestDTOBuilder sexo(String sexo) {
            this.sexo = sexo;
            return this;
        }

        public PacienteRequestDTOBuilder ocupacion(String ocupacion) {
            this.ocupacion = ocupacion;
            return this;
        }

        public PacienteRequestDTOBuilder estadoCivil(String estadoCivil) {
            this.estadoCivil = estadoCivil;
            return this;
        }

        public PacienteRequestDTOBuilder escolaridad(String escolaridad) {
            this.escolaridad = escolaridad;
            return this;
        }

        public PacienteRequestDTOBuilder datosPadres(String datosPadres) {
            this.datosPadres = datosPadres;
            return this;
        }

        public PacienteRequestDTOBuilder datosHijos(String datosHijos) {
            this.datosHijos = datosHijos;
            return this;
        }

        public PacienteRequestDTOBuilder datosHermanos(String datosHermanos) {
            this.datosHermanos = datosHermanos;
            return this;
        }

        public PacienteRequestDTO build() {
            return new PacienteRequestDTO(nombre, apellido, dni, email, telefono, fechaNacimiento, ciudad, direccion,
                    sexo, ocupacion, estadoCivil, escolaridad, datosPadres, datosHijos, datosHermanos);
        }
    }
}
