package com.consultorio.repository;

import com.consultorio.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Paciente.
 * Proporciona métodos de acceso a datos con filtrado automático de registros
 * inactivos.
 */
@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    /**
     * Encuentra todos los pacientes activos, ordenados por apellido
     */
    List<Paciente> findByActiveTrueOrderByApellidoAsc();

    /**
     * Busca un paciente activo por su DNI
     */
    Optional<Paciente> findByDniAndActiveTrue(String dni);

    /**
     * Busca un paciente activo por su email
     */
    Optional<Paciente> findByEmailAndActiveTrue(String email);

    /**
     * Busca un paciente activo por su ID
     */
    Optional<Paciente> findByIdAndActiveTrue(Long id);

    /**
     * Verifica si existe un paciente activo con el DNI dado
     */
    boolean existsByDniAndActiveTrue(String dni);

    /**
     * Verifica si existe un paciente activo con el email dado
     */
    boolean existsByEmailAndActiveTrue(String email);

    /**
     * Busca pacientes activos cuyo nombre o apellido contenga el texto dado
     * (búsqueda insensible a mayúsculas)
     */
    @Query("SELECT p FROM Paciente p WHERE p.active = true AND " +
            "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.apellido) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Paciente> searchByNombreOrApellido(String searchTerm);

    /**
     * Cuenta el número de pacientes activos.
     */
    long countByActiveTrue();
}
