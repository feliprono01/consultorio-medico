package com.consultorio.service;

import com.consultorio.dto.PacienteFamiliaDTO;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

        // Validar que no exista un paciente activo con el mismo email (solo si se proporcionó email)
        if (requestDTO.getEmail() != null && !requestDTO.getEmail().isBlank()
                && pacienteRepository.existsByEmailAndActiveTrue(requestDTO.getEmail())) {
            throw new IllegalArgumentException("Ya existe un paciente activo con el email: " + requestDTO.getEmail());
        }

        // Convertir DTO a entidad y guardar
        Paciente paciente = pacienteMapper.toEntity(requestDTO);

        // Si el paciente firmó el consentimiento y no se indicó una fecha, registrar la fecha de hoy
        if (Boolean.TRUE.equals(paciente.getConsentimientoInformado()) && paciente.getFechaConsentimiento() == null) {
            paciente.setFechaConsentimiento(java.time.LocalDate.now());
        }

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
        List<Paciente> pacientes = pacienteRepository.findTop500ByActiveTrueOrderByApellidoAsc();
        return pacienteMapper.toResponseDTOList(pacientes);
    }

    /**
     * Lista pacientes activos con paginación real y búsqueda opcional por
     * nombre, apellido o DNI. Usado por el listado principal de pacientes.
     */
    @Transactional(readOnly = true)
    public Page<PacienteResponseDTO> listarPacientesPaginado(int page, int size, String q) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by("apellido").ascending());

        Page<Paciente> resultado = (q == null || q.isBlank())
                ? pacienteRepository.findByActiveTrue(pageable)
                : pacienteRepository.searchByNombreApellidoOrDni(q, pageable);

        return resultado.map(pacienteMapper::toResponseDTO);
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

        // Validar email único (si cambió) — null-safe con Objects.equals
        if (!java.util.Objects.equals(pacienteExistente.getEmail(), requestDTO.getEmail())) {
            if (requestDTO.getEmail() != null && !requestDTO.getEmail().isBlank()
                    && pacienteRepository.existsByEmailAndActiveTrue(requestDTO.getEmail())) {
                throw new IllegalArgumentException(
                        "Ya existe un paciente activo con el email: " + requestDTO.getEmail());
            }
        }

        // Actualizar campos
        pacienteMapper.updateEntityFromDTO(requestDTO, pacienteExistente);

        // Si acaba de dar el consentimiento y no tiene fecha, registrar la fecha de hoy
        if (Boolean.TRUE.equals(pacienteExistente.getConsentimientoInformado())
                && pacienteExistente.getFechaConsentimiento() == null) {
            pacienteExistente.setFechaConsentimiento(java.time.LocalDate.now());
        }

        Paciente pacienteActualizado = pacienteRepository.save(pacienteExistente);

        log.info("Paciente actualizado exitosamente con ID: {}", id);
        return pacienteMapper.toResponseDTO(pacienteActualizado);
    }

    /**
     * Actualiza solo la composición familiar de un paciente (datosPadres/
     * datosHijos/datosHermanos), de forma independiente al resto de la
     * ficha — así guardar "Familiares" no pisa cambios sin guardar que
     * pueda haber en "Datos Personales", y viceversa.
     */
    @Transactional
    public PacienteResponseDTO actualizarDatosFamiliares(Long id, PacienteFamiliaDTO dto) {
        log.info("Actualizando datos familiares del paciente ID: {}", id);

        Paciente paciente = pacienteRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente", "id", id));

        if (dto.getVersion() != null && !dto.getVersion().equals(paciente.getVersion())) {
            throw new org.springframework.orm.ObjectOptimisticLockingFailureException(Paciente.class, id);
        }

        paciente.setDatosPadres(dto.getDatosPadres());
        paciente.setDatosHijos(dto.getDatosHijos());
        paciente.setDatosHermanos(dto.getDatosHermanos());

        Paciente pacienteActualizado = pacienteRepository.save(paciente);

        log.info("Datos familiares actualizados para paciente ID: {}", id);
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
        logHpIfChanged(pacienteId, "Historia Sexual",
                historia.getHistoriaSexual(), dto.getHistoriaSexual(), currentUser);
        logHpIfChanged(pacienteId, "Historia Marital",
                historia.getHistoriaMarital(), dto.getHistoriaMarital(), currentUser);
        logHpIfChanged(pacienteId, "Hábitos",
                historia.getHabitos(), dto.getHabitos(), currentUser);

        // Actualizar campos
        historia.setAntecedentesFamiliares(dto.getAntecedentesFamiliares());
        historia.setAntecedentesPersonales(dto.getAntecedentesPersonales());
        historia.setHistoriaConsumo(dto.getHistoriaConsumo());
        historia.setEnfermedadActual(dto.getEnfermedadActual());
        historia.setTratamientosPrevios(dto.getTratamientosPrevios());
        historia.setDesarrolloPsicomotor(dto.getDesarrolloPsicomotor());
        historia.setPersonalidadPrevia(dto.getPersonalidadPrevia());
        historia.setAntecedentesPsicologicos(dto.getAntecedentesPsicologicos());
        historia.setHistoriaSexual(dto.getHistoriaSexual());
        historia.setHistoriaMarital(dto.getHistoriaMarital());
        historia.setHabitos(dto.getHabitos());

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
     *
     * `synchronized`: arma la cadena de integridad (lee el último hash de la
     * tabla, calcula el siguiente, guarda) — con una sola instancia de la
     * app, esto alcanza para que dos cambios simultáneos no lean el mismo
     * "último hash" y rompan el encadenado. Ver security.HashChainUtil.
     */
    private synchronized void logHpIfChanged(Long pacienteId, String campo,
            String valorAnterior, String valorNuevo, String usuario) {
        if (Objects.equals(valorAnterior, valorNuevo)) return;
        // No loguear si ambos son null o vacíos
        if ((valorAnterior == null || valorAnterior.isBlank())
                && (valorNuevo == null || valorNuevo.isBlank())) return;

        HistoriaPsiquiatricaAuditLog log =
                new HistoriaPsiquiatricaAuditLog(pacienteId, campo, valorAnterior, valorNuevo, usuario);

        String hashAnterior = hpAuditLogRepository.findFirstByOrderByIdDesc()
                .map(HistoriaPsiquiatricaAuditLog::getHash)
                .orElse(com.consultorio.security.HashChainUtil.GENESIS);
        log.setHashAnterior(hashAnterior);
        log.setHash(com.consultorio.security.HashChainUtil.siguienteHash(hashAnterior,
                campo, valorAnterior, valorNuevo, log.getFechaCambio().toString(), usuario));

        hpAuditLogRepository.save(log);
    }

    /**
     * Recorre toda la tabla de auditoría de historia psiquiátrica en orden
     * de inserción y recalcula cada hash, comparando contra el guardado —
     * mismo mecanismo que verificarCadenaAuditoria() en ConsultaService.
     */
    @Transactional(readOnly = true)
    public com.consultorio.dto.VerificacionCadenaDTO verificarCadenaAuditoriaHp() {
        List<HistoriaPsiquiatricaAuditLog> registros = hpAuditLogRepository.findAllByOrderByIdAsc();

        String hashEsperado = com.consultorio.security.HashChainUtil.GENESIS;
        for (HistoriaPsiquiatricaAuditLog registro : registros) {
            if (!Objects.equals(registro.getHashAnterior(), hashEsperado)) {
                return new com.consultorio.dto.VerificacionCadenaDTO(false, registros.size(), registro.getId());
            }
            String hashRecalculado = com.consultorio.security.HashChainUtil.siguienteHash(hashEsperado,
                    registro.getCampo(), registro.getValorAnterior(), registro.getValorNuevo(),
                    registro.getFechaCambio().toString(), registro.getModificadoPor());
            if (!Objects.equals(registro.getHash(), hashRecalculado)) {
                return new com.consultorio.dto.VerificacionCadenaDTO(false, registros.size(), registro.getId());
            }
            hashEsperado = registro.getHash();
        }

        return new com.consultorio.dto.VerificacionCadenaDTO(true, registros.size(), null);
    }

    /**
     * Recalcula desde cero el hash y hash_anterior de TODOS los registros de
     * la tabla, en orden de inserción. Mismo propósito y misma garantía de
     * idempotencia que ConsultaService.backfillCadenaAuditoria() — ver ahí
     * para el detalle. Solo ADMIN, ver PacienteController.
     */
    @Transactional
    public com.consultorio.dto.VerificacionCadenaDTO backfillCadenaAuditoriaHp() {
        List<HistoriaPsiquiatricaAuditLog> registros = hpAuditLogRepository.findAllByOrderByIdAsc();

        String hashAnterior = com.consultorio.security.HashChainUtil.GENESIS;
        for (HistoriaPsiquiatricaAuditLog registro : registros) {
            String hash = com.consultorio.security.HashChainUtil.siguienteHash(hashAnterior,
                    registro.getCampo(), registro.getValorAnterior(), registro.getValorNuevo(),
                    registro.getFechaCambio().toString(), registro.getModificadoPor());
            registro.setHashAnterior(hashAnterior);
            registro.setHash(hash);
            hashAnterior = hash;
        }
        hpAuditLogRepository.saveAll(registros);

        return verificarCadenaAuditoriaHp();
    }
}
