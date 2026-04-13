package com.consultorio.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad que representa un Paciente en el sistema.
 * Hereda campos de auditoría y soft delete de la clase Auditable.
 */
@Entity
@Table(name = "pacientes", indexes = {
        @Index(name = "idx_dni", columnList = "dni"),
        @Index(name = "idx_email", columnList = "email")
})
public class Paciente extends Auditable {

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, unique = true, length = 20)
    private String dni;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String telefono;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(length = 100)
    private String ciudad;

    @Column(length = 200)
    private String direccion;

    @Column(length = 20)
    private String sexo;

    @Column(length = 100)
    private String ocupacion;

    @Column(length = 50)
    private String estadoCivil;

    @Column(length = 100)
    private String escolaridad;

    @Column(columnDefinition = "TEXT")
    private String datosPadres;

    @Column(columnDefinition = "TEXT")
    private String datosHijos;

    @Column(columnDefinition = "TEXT")
    private String datosHermanos;

    @OneToMany(mappedBy = "paciente")
    private List<Consulta> consultas = new ArrayList<>();

    @OneToOne(mappedBy = "paciente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private HistoriaPsiquiatrica historiaPsiquiatrica;

    public Paciente() {
    }

    public Paciente(Long id, LocalDateTime createdAt, LocalDateTime updatedAt, Boolean active, String nombre,
            String apellido, String dni, String email, String telefono, LocalDate fechaNacimiento,
            String ciudad, String direccion, String sexo,
            String ocupacion, String estadoCivil, String escolaridad,
            String datosPadres, String datosHijos, String datosHermanos,
            List<Consulta> consultas, HistoriaPsiquiatrica historiaPsiquiatrica) {
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.active = active;
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
        this.consultas = consultas != null ? consultas : new ArrayList<>();
        this.historiaPsiquiatrica = historiaPsiquiatrica;
    }

    public static PacienteBuilder builder() {
        return new PacienteBuilder();
    }

    public static class PacienteBuilder {
        private Long id;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Boolean active = true;
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
        private List<Consulta> consultas = new ArrayList<>();
        private HistoriaPsiquiatrica historiaPsiquiatrica;

        public PacienteBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PacienteBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PacienteBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public PacienteBuilder active(Boolean active) {
            this.active = active;
            return this;
        }

        public PacienteBuilder nombre(String nombre) {
            this.nombre = nombre;
            return this;
        }

        public PacienteBuilder apellido(String apellido) {
            this.apellido = apellido;
            return this;
        }

        public PacienteBuilder dni(String dni) {
            this.dni = dni;
            return this;
        }

        public PacienteBuilder email(String email) {
            this.email = email;
            return this;
        }

        public PacienteBuilder telefono(String telefono) {
            this.telefono = telefono;
            return this;
        }

        public PacienteBuilder fechaNacimiento(LocalDate fechaNacimiento) {
            this.fechaNacimiento = fechaNacimiento;
            return this;
        }

        public PacienteBuilder ciudad(String ciudad) {
            this.ciudad = ciudad;
            return this;
        }

        public PacienteBuilder direccion(String direccion) {
            this.direccion = direccion;
            return this;
        }

        public PacienteBuilder sexo(String sexo) {
            this.sexo = sexo;
            return this;
        }

        public PacienteBuilder ocupacion(String ocupacion) {
            this.ocupacion = ocupacion;
            return this;
        }

        public PacienteBuilder estadoCivil(String estadoCivil) {
            this.estadoCivil = estadoCivil;
            return this;
        }

        public PacienteBuilder escolaridad(String escolaridad) {
            this.escolaridad = escolaridad;
            return this;
        }

        public PacienteBuilder datosPadres(String datosPadres) {
            this.datosPadres = datosPadres;
            return this;
        }

        public PacienteBuilder datosHijos(String datosHijos) {
            this.datosHijos = datosHijos;
            return this;
        }

        public PacienteBuilder datosHermanos(String datosHermanos) {
            this.datosHermanos = datosHermanos;
            return this;
        }

        public PacienteBuilder consultas(List<Consulta> consultas) {
            this.consultas = consultas;
            return this;
        }

        public PacienteBuilder historiaPsiquiatrica(HistoriaPsiquiatrica historiaPsiquiatrica) {
            this.historiaPsiquiatrica = historiaPsiquiatrica;
            return this;
        }

        public Paciente build() {
            return new Paciente(id, createdAt, updatedAt, active, nombre, apellido, dni, email, telefono,
                    fechaNacimiento, ciudad, direccion, sexo, ocupacion, estadoCivil, escolaridad,
                    datosPadres, datosHijos, datosHermanos, consultas, historiaPsiquiatrica);
        }
    }

    public String getNombreCompleto() {
        return apellido + ", " + nombre;
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

    public List<Consulta> getConsultas() {
        return consultas;
    }

    public void setConsultas(List<Consulta> consultas) {
        this.consultas = consultas;
    }

    public HistoriaPsiquiatrica getHistoriaPsiquiatrica() {
        return historiaPsiquiatrica;
    }

    public void setHistoriaPsiquiatrica(HistoriaPsiquiatrica historiaPsiquiatrica) {
        this.historiaPsiquiatrica = historiaPsiquiatrica;
    }

    // Inherited from Auditable (Explicit overrides/accessors not strictly needed if
    // protected fields are used, but good for POJO compliance)
    @Override
    public Long getId() {
        return id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }
}
