package com.consultorio.repository;

import com.consultorio.model.Paciente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
     * Encuentra los primeros 500 pacientes activos, ordenados por apellido.
     * Tope de seguridad: evita cargar la tabla completa en memoria si el
     * consultorio llega a acumular muchos años de pacientes. Paginación real
     * con UI de "página siguiente" queda como mejora futura.
     */
    List<Paciente> findTop500ByActiveTrueOrderByApellidoAsc();

    /**
     * Paginación real de pacientes activos, para el listado principal
     * (/api/pacientes/pagina). El findTop500 de arriba sigue existiendo aparte
     * porque lo usan los buscadores tipo-autocompletar (ConsultationFormPage,
     * EvolutionFormPage), que necesitan el array completo en memoria.
     */
    Page<Paciente> findByActiveTrue(Pageable pageable);

    /**
     * Igual que searchByNombreOrApellido pero paginado y sumando DNI, para el
     * listado principal cuando hay término de búsqueda.
     */
    @Query("SELECT p FROM Paciente p WHERE p.active = true AND " +
            "(LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(p.apellido) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "p.dni LIKE CONCAT('%', :q, '%'))")
    Page<Paciente> searchByNombreApellidoOrDni(@Param("q") String q, Pageable pageable);

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
