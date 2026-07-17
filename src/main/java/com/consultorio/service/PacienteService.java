package com.consultorio.service;

import com.consultorio.dto.PacienteRequestDTO;
import com.consultorio.dto.PacienteResponseDTO;
import com.consultorio.exception.ResourceNotFoundException;
import com.consultorio.mapper.PacienteMapper;
import com.consultorio.model.HistoriaPsiquiatricaAuditLog;
import com.consultorio.model.Paciente;
import com.consultorio.repository.HistoriaPsiquiatricaAuditLogRepository;
import com.consultorio.repository.PacienteRepository;

import com.consultorio.dto.HistoriaPsiquiatricaDTO;
import com.consultorio.model.HistoriaPsiquiatrica;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/**
 * Servicio que contiene la lógica de negocio para la gestión de Pacientes.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final PacienteMapper pacienteMapper;
    private final AccessLogService accessLogService;
    private final HistoriaPsiquiatricaAuditLogRepository hpAuditLogRepository;

    /**
     * Crea un nuevo paciente en el sistema.
     * Valida que no exista otro paciente con el mismo DNI o email.
     */
    @Transactional
    public PacienteResponseDTO crearPaciente(PacienteRequestDTO requestDTO) {
        log.info("Creando nuevo paciente con DNI: {}", requestDTO.getDni());

        // Validar que no exista un paciente activo con el mismo DNI
        if (pacienteRepository.existsByDniAndActiveTrue(requestDTO.getDni())) {
            throw new IllegalArgumentException("Ya existe un paciente activo con el DNI: " + requestDTO.getDni());
        }

        // Validar que no exista un paciente activo con el mismo email
        if (pacienteRepository.existsByEmailAndActiveTrue(requestDTO.getEmail())) {
            throw new IllegalArgumentException("Ya existe un paciente activo con el email: " + requestDTO.getEmail());
        }

        // Convertir DTO a entidad y guardar
        Paciente paciente = pacienteMapper.toEntity(requestDTO);
        Paciente pacienteGuardado = pacienteRepository.save(paciente);

        log.info("Paciente creado exitosamente con ID: {}", pacienteGuardado.getId());
        return pacienteMapper.toResponseDTO(pacienteGuardado);
    }

    /**
     * Obtiene todos los pacientes activos, ordenados por apellido.
     */
    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> listarPacientesActivos() {
        log.info("Listando todos los pacientes activos");
        List<Paciente> pacientes = pacienteRepository.findByActiveTrueOrderByApellidoAsc();
        return pacienteMapper.toResponseDTOList(pacientes);
    }

    /**
     * Busca un paciente activo por su ID.
     */
    @Transactional(readOnly = true)
    public PacienteResponseDTO obtenerPacientePorId(Long id) {
        log.info("Buscando paciente con ID: {}", id);
        Paciente paciente = pacienteRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente", "id", id));

        // Auditoría de lectura — quién accedió a la ficha del paciente
        accessLogService.registrar(id, AccessLogService.VER_FICHA,
                "Ficha: %s %s".formatted(paciente.getNombre(), paciente.getApellido()));

        return pacienteMapper.toResponseDTO(paciente);
    }

    /**
     * Busca un paciente activo por su DNI.
     */
    @Transactional(readOnly = true)
    public PacienteResponseDTO obtenerPacientePorDni(String dni) {
        log.info("Buscando paciente con DNI: {}", dni);
        Paciente paciente = pacienteRepository.findByDniAndActiveTrue(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente", "DNI", dni));
        return pacienteMapper.toResponseDTO(paciente);
    }

    /**
     * Actualiza los datos de un paciente existente.
     */
    @Transactional
    public PacienteResponseDTO actualizarPaciente(Long id, PacienteRequestDTO requestDTO) {
        log.info("Actualizando paciente con ID: {}", id);

        // Buscar el paciente existente
        Paciente pacienteExistente = pacienteRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente", "id", id));

        // Validar versión para concurrencia optimista
        if (requestDTO.getVersion() != null && !requestDTO.getVersion().equals(pacienteExistente.getVersion())) {
            throw new org.springframework.orm.ObjectOptimisticLockingFailureException(Paciente.class, id);
        }

        // Validar DNI único (si cambió)
        if (!pacienteExistente.getDni().equals(requestDTO.getDni())) {
            if (pacienteRepository.existsByDniAndActiveTrue(requestDTO.getDni())) {
                throw new IllegalArgumentException("Ya existe un paciente activo con el DNI: " + requestDTO.getDni());
            }
        }

        // Validar email único (si cambió)
        if (!pacienteExistente.getEmail().equals(requestDTO.getEmail())) {
            if (pacienteRepository.existsByEmailAndActiveTrue(requestDTO.getEmail())) {
                throw new IllegalArgumentException(
                        "Ya existe un paciente activo con el email: " + requestDTO.getEmail());
            }
        }

        // Actualizar campos
        pacienteMapper.updateEntityFromDTO(requestDTO, pacienteExistente);
        Paciente pacienteActualizado = pacienteRepository.save(pacienteExistente);

        log.info("Paciente actualizado exitosamente con ID: {}", id);
        return pacienteMapper.toResponseDTO(pacienteActualizado);
    }

    /**
     * Elimina lógicamente un paciente (soft delete).
     * No borra el registro de la base de datos, solo lo marca como inactivo.
     */
    @Transactional
    public void eliminarPaciente(Long id) {
        log.info("Eliminando (soft delete) paciente con ID: {}", id);

        Paciente paciente = pacienteRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente", "id", id));

        paciente.softDelete();
        pacienteRepository.save(paciente);

        log.info("Paciente eliminado lógicamente con ID: {}", id);
    }

    /**
     * Busca pacientes activos por nombre o apellido (búsqueda parcial).
     */
    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> buscarPacientes(String searchTerm) {
        log.info("Buscando pacientes con término: {}", searchTerm);
        List<Paciente> pacientes = pacienteRepository.searchByNombreOrApellido(searchTerm);
        return pacienteMapper.toResponseDTOList(pacientes);
    }

    /**
     * Actualiza o crea la Historia Psiquiátrica de un paciente.
     * Registra campo por campo qué cambio, quién lo hizo y cuándo.
     */
    @Transactional
    public PacienteResponseDTO actualizarHistoriaPsiquiatrica(Long pacienteId, HistoriaPsiquiatricaDTO dto) {
        log.info("Actualizando historia psiquiátrica para paciente ID: {}", pacienteId);

        Paciente paciente = pacienteRepository.findByIdAndActiveTrue(pacienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente", "id", pacienteId));

        HistoriaPsiquiatrica historia = paciente.getHistoriaPsiquiatrica();
        boolean esNueva = (historia == null);

        if (!esNueva && dto.getVersion() != null && !dto.getVersion().equals(historia.getVersion())) {
            throw new org.springframework.orm.ObjectOptimisticLockingFailureException(HistoriaPsiquiatrica.class, historia.getId());
        }

        if (esNueva) {
            historia = HistoriaPsiquiatrica.builder()
                    .paciente(paciente)
                    .build();
        }

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        // Auditar campo por campo — solo se registra si hubo cambio real
        logHpIfChanged(pacienteId, "Antecedentes Familiares",
                historia.getAntecedentesFamiliares(), dto.getAntecedentesFamiliares(), currentUser);
        logHpIfChanged(pacienteId, "Antecedentes Personales",
                historia.getAntecedentesPersonales(), dto.getAntecedentesPersonales(), currentUser);
        logHpIfChanged(pacienteId, "Historia de Consumo",
                historia.getHistoriaConsumo(), dto.getHistoriaConsumo(), currentUser);
        logHpIfChanged(pacienteId, "Enfermedad Actual",
                historia.getEnfermedadActual(), dto.getEnfermedadActual(), currentUser);
        logHpIfChanged(pacienteId, "Tratamientos Previos",
                historia.getTratamientosPrevios(), dto.getTratamientosPrevios(), currentUser);
        logHpIfChanged(pacienteId, "Desarrollo Psicomotor",
                historia.getDesarrolloPsicomotor(), dto.getDesarrolloPsicomotor(), currentUser);
        logHpIfChanged(pacienteId, "Personalidad Previa",
                historia.getPersonalidadPrevia(), dto.getPersonalidadPrevia(), currentUser);
        logHpIfChanged(pacienteId, "Antecedentes Psicológicos",
                historia.getAntecedentesPsicologicos(), dto.getAntecedentesPsicologicos(), currentUser);

        // Actualizar campos
        historia.setAntecedentesFamiliares(dto.getAntecedentesFamiliares());
        historia.setAntecedentesPersonales(dto.getAntecedentesPersonales());
        historia.setHistoriaConsumo(dto.getHistoriaConsumo());
        historia.setEnfermedadActual(dto.getEnfermedadActual());
        historia.setTratamientosPrevios(dto.getTratamientosPrevios());
        historia.setDesarrolloPsicomotor(dto.getDesarrolloPsicomotor());
        historia.setPersonalidadPrevia(dto.getPersonalidadPrevia());
        historia.setAntecedentesPsicologicos(dto.getAntecedentesPsicologicos());

        paciente.setHistoriaPsiquiatrica(historia);
        Paciente pacienteGuardado = pacienteRepository.save(paciente);

        return pacienteMapper.toResponseDTO(pacienteGuardado);
    }

    /**
     * Devuelve el historial de cambios de la HistoriaPsiquiátrica de un paciente.
     */
    @Transactional(readOnly = true)
    public List<HistoriaPsiquiatricaAuditLog> getHistorialCambiosHp(Long pacienteId) {
        return hpAuditLogRepository.findByPacienteIdOrderByFechaCambioDesc(pacienteId);
    }

    /**
     * Guarda un entrada de audit log si el valor del campo cambió.
     * Ignora cambios de null/vacío a null/vacío.
     */
    private void logHpIfChanged(Long pacienteId, String campo,
            String valorAnterior, String valorNuevo, String usuario) {
        if (Objects.equals(valorAnterior, valorNuevo)) return;
        // No loguear si ambos son null o vacíos
        if ((valorAnterior == null || valorAnterior.isBlank())
                && (valorNuevo == null || valorNuevo.isBlank())) return;

        hpAuditLogRepository.save(
                new HistoriaPsiquiatricaAuditLog(pacienteId, campo, valorAnterior, valorNuevo, usuario));
    }
}
