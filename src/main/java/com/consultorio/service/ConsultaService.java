package com.consultorio.service;

import com.consultorio.dto.ConsultaRequestDTO;
import com.consultorio.dto.ConsultaResponseDTO;
import com.consultorio.model.Consulta;
import com.consultorio.model.Paciente;
import com.consultorio.repository.ConsultaRepository;
import com.consultorio.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.consultorio.model.ConsultaAuditLog;
import com.consultorio.repository.ConsultaAuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ConsultaService {

    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;
    private final ConsultaAuditLogRepository consultaAuditLogRepository;
    private final com.consultorio.repository.MedicacionRepository medicacionRepository;
    private final com.consultorio.mapper.ConsultaMapper consultaMapper;
    private final com.consultorio.mapper.EvaluacionPsiquiatricaMapper evaluacionMapper;
    private final AccessLogService accessLogService;

    @Transactional
    public ConsultaResponseDTO crearConsulta(ConsultaRequestDTO dto) {
        Paciente paciente = pacienteRepository.findByIdAndActiveTrue(dto.getPacienteId())
                .orElseThrow(() -> new com.consultorio.exception.ResourceNotFoundException("Paciente", "id",
                        dto.getPacienteId()));

        Consulta consulta = consultaMapper.toEntity(dto, paciente);

        if (consulta.getFechaConsulta() == null) {
            consulta.setFechaConsulta(LocalDateTime.now());
        }

        // Manejo de Evaluación Psiquiátrica
        if (dto.getEvaluacionPsiquiatrica() != null) {
            com.consultorio.model.EvaluacionPsiquiatrica evaluacion = evaluacionMapper.toEntity(dto.getEvaluacionPsiquiatrica());
            evaluacion.setConsulta(consulta);
            consulta.setEvaluacionPsiquiatrica(evaluacion);
        }

        Consulta guardada = consultaRepository.save(consulta);
        guardarMedicaciones(guardada, dto.getMedicaciones());

        ConsultaResponseDTO response = consultaMapper.toResponseDTO(guardada);
        response.setMedicaciones(dto.getMedicaciones());
        return response;
    }

    /** Reemplaza toda la lista de medicaciones de una consulta — se borran las
     *  viejas y se insertan las nuevas, no hace falta un diff más fino porque
     *  es una lista chica y el cambio ya queda registrado como un solo campo
     *  de auditoría (ver actualizarConsulta). */
    private void guardarMedicaciones(Consulta consulta, List<com.consultorio.dto.MedicacionDTO> medicaciones) {
        medicacionRepository.deleteByConsultaId(consulta.getId());
        if (medicaciones == null) return;
        for (com.consultorio.dto.MedicacionDTO m : medicaciones) {
            if (m.getFarmaco() == null || m.getFarmaco().isBlank()) continue;
            medicacionRepository.save(new com.consultorio.model.Medicacion(consulta, m.getFarmaco(), m.getDosis(), m.getFrecuencia()));
        }
    }

    /** Texto legible de una lista de medicaciones, para poder auditar el
     *  cambio con el mismo mecanismo de hash-chain que el resto de los
     *  campos (que compara strings, no listas). */
    private String describirMedicaciones(List<com.consultorio.dto.MedicacionDTO> medicaciones) {
        if (medicaciones == null || medicaciones.isEmpty()) return null;
        StringBuilder sb = new StringBuilder();
        for (com.consultorio.dto.MedicacionDTO m : medicaciones) {
            if (m.getFarmaco() == null || m.getFarmaco().isBlank()) continue;
            if (sb.length() > 0) sb.append("; ");
            sb.append(m.getFarmaco());
            if (m.getDosis() != null && !m.getDosis().isBlank()) sb.append(" ").append(m.getDosis());
            if (m.getFrecuencia() != null && !m.getFrecuencia().isBlank()) sb.append(" ").append(m.getFrecuencia());
        }
        return sb.length() > 0 ? sb.toString() : null;
    }

    private List<com.consultorio.dto.MedicacionDTO> obtenerMedicaciones(Long consultaId) {
        return medicacionRepository.findByConsultaIdOrderByIdAsc(consultaId).stream()
                .map(m -> new com.consultorio.dto.MedicacionDTO(m.getId(), m.getFarmaco(), m.getDosis(), m.getFrecuencia()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> obtenerHistorial(Long pacienteId) {
        if (!pacienteRepository.existsById(pacienteId)) {
            throw new com.consultorio.exception.ResourceNotFoundException("Paciente", "id", pacienteId);
        }

        List<Consulta> consultas = consultaRepository.findByPacienteIdAndActiveTrueOrderByFechaConsultaDesc(pacienteId);

        // Auditoría de lectura — quién accedió al historial completo y cuándo
        accessLogService.registrar(pacienteId, AccessLogService.VER_HISTORIAL,
                "Historial completo (%d consultas)".formatted(consultas.size()));

        List<ConsultaResponseDTO> resultado = consultaMapper.toResponseDTOList(consultas);
        resultado.forEach(dto -> dto.setMedicaciones(obtenerMedicaciones(dto.getId())));
        return resultado;
    }

    /**
     * Lista consultas activas con paginación real y búsqueda opcional.
     * Sin término de búsqueda: pagina directamente en la base de datos.
     * Con término de búsqueda: motivo/diagnóstico están cifrados (AES-GCM
     * no determinístico), así que no se pueden filtrar por SQL LIKE — se
     * trae el mismo bloque acotado de siempre, se desencripta al mapear a
     * DTO, y se filtra/pagina en memoria (mismo alcance de búsqueda que
     * tenía el filtro del lado del cliente).
     */
    @Transactional(readOnly = true)
    public Page<ConsultaResponseDTO> obtenerTodas(int page, int size, String q) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(safePage, safeSize);

        if (q == null || q.isBlank()) {
            return consultaRepository.findByActiveTrueOrderByFechaConsultaDesc(pageable)
                    .map(consultaMapper::toResponseDTO);
        }

        List<ConsultaResponseDTO> candidatos = consultaRepository
                .findTop500ByActiveTrueOrderByFechaConsultaDesc()
                .stream()
                .map(consultaMapper::toResponseDTO)
                .filter(dto -> matchesSearch(dto, q))
                .toList();

        int from = Math.min(safePage * safeSize, candidatos.size());
        int to = Math.min(from + safeSize, candidatos.size());
        return new PageImpl<>(candidatos.subList(from, to), pageable, candidatos.size());
    }

    private boolean matchesSearch(ConsultaResponseDTO dto, String q) {
        String term = q.toLowerCase();
        return containsIgnoreCase(dto.getNombrePaciente(), term)
                || containsIgnoreCase(dto.getApellidoPaciente(), term)
                || containsIgnoreCase(dto.getDniPaciente(), term)
                || containsIgnoreCase(dto.getMotivo(), term)
                || containsIgnoreCase(dto.getDiagnostico(), term);
    }

    private boolean containsIgnoreCase(String value, String term) {
        return value != null && value.toLowerCase().contains(term);
    }

    @Transactional
    public void eliminarConsulta(Long id) {
        Consulta consulta = consultaRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new com.consultorio.exception.ResourceNotFoundException("Consulta", "id", id));
        consulta.softDelete();
        consultaRepository.save(consulta);
    }

    @Transactional(readOnly = true)
    public ConsultaResponseDTO obtenerPorId(Long id) {
        Consulta consulta = consultaRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new com.consultorio.exception.ResourceNotFoundException("Consulta", "id", id));

        // Auditoría de lectura — quién vio una consulta individual y cuándo
        if (consulta.getPaciente() != null) {
            accessLogService.registrar(consulta.getPaciente().getId(), AccessLogService.VER_CONSULTA,
                    "Consulta #%d del %s".formatted(id, consulta.getFechaConsulta()));
        }

        ConsultaResponseDTO response = consultaMapper.toResponseDTO(consulta);
        response.setMedicaciones(obtenerMedicaciones(id));
        return response;
    }

    @Transactional
    public ConsultaResponseDTO actualizarConsulta(Long id, ConsultaRequestDTO dto) {
        Consulta consulta = consultaRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new com.consultorio.exception.ResourceNotFoundException("Consulta", "id", id));

        // Validar versión para concurrencia optimista
        if (dto.getVersion() != null && !dto.getVersion().equals(consulta.getVersion())) {
            throw new org.springframework.orm.ObjectOptimisticLockingFailureException(Consulta.class, id);
        }

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        // Actualizar datos de consulta general con auditoría
        logIfChanged(consulta, "Motivo", consulta.getMotivo(), dto.getMotivo(), currentUser);
        consulta.setMotivo(dto.getMotivo());

        logIfChanged(consulta, "Diagnóstico", consulta.getDiagnostico(), dto.getDiagnostico(), currentUser);
        consulta.setDiagnostico(dto.getDiagnostico());

        logIfChanged(consulta, "Tratamiento", consulta.getTratamiento(), dto.getTratamiento(), currentUser);
        consulta.setTratamiento(dto.getTratamiento());

        logIfChanged(consulta, "Notas", consulta.getNotas(), dto.getNotas(), currentUser);
        consulta.setNotas(dto.getNotas());

        logIfChanged(consulta, "Estado Ánimo", consulta.getEstadoAnimo(), dto.getEstadoAnimo(), currentUser);
        consulta.setEstadoAnimo(dto.getEstadoAnimo());

        logIfChanged(consulta, "Calidad Sueño", consulta.getCalidadSueno(), dto.getCalidadSueno(), currentUser);
        consulta.setCalidadSueno(dto.getCalidadSueno());

        logIfChanged(consulta, "Alimentación", consulta.getAlimentacion(), dto.getAlimentacion(), currentUser);
        consulta.setAlimentacion(dto.getAlimentacion());

        logIfChanged(consulta, "Sociabilidad", consulta.getSociabilidad(), dto.getSociabilidad(), currentUser);
        consulta.setSociabilidad(dto.getSociabilidad());

        logIfChanged(consulta, "Funcionalidad Laboral", consulta.getFuncionalidadLaboral(), dto.getFuncionalidadLaboral(), currentUser);
        consulta.setFuncionalidadLaboral(dto.getFuncionalidadLaboral());

        logIfChanged(consulta, "Funcionalidad Social", consulta.getFuncionalidadSocial(), dto.getFuncionalidadSocial(), currentUser);
        consulta.setFuncionalidadSocial(dto.getFuncionalidadSocial());

        logIfChanged(consulta, "Funcionalidad Familiar", consulta.getFuncionalidadFamiliar(), dto.getFuncionalidadFamiliar(), currentUser);
        consulta.setFuncionalidadFamiliar(dto.getFuncionalidadFamiliar());

        // Actualizar o crear Evaluación Psiquiátrica — se audita cada campo por
        // separado, en particular los de riesgo (suicida/homicida/propio), que son
        // los de mayor peso legal ante cualquier revisión de responsabilidad
        // profesional: no puede quedar un cambio ahí sin quién, cuándo y con qué
        // valor anterior.
        if (dto.getEvaluacionPsiquiatrica() != null) {
            com.consultorio.model.EvaluacionPsiquiatrica evaluacion = consulta.getEvaluacionPsiquiatrica();
            if (evaluacion == null) {
                evaluacion = new com.consultorio.model.EvaluacionPsiquiatrica();
                evaluacion.setConsulta(consulta);
                consulta.setEvaluacionPsiquiatrica(evaluacion);
            }

            var evalDto = dto.getEvaluacionPsiquiatrica();
            logIfChanged(consulta, "Evaluación: Apariencia", evaluacion.getApariencia(), evalDto.getApariencia(), currentUser);
            logIfChanged(consulta, "Evaluación: Conducta", evaluacion.getConducta(), evalDto.getConducta(), currentUser);
            logIfChanged(consulta, "Evaluación: Lenguaje", evaluacion.getLenguaje(), evalDto.getLenguaje(), currentUser);
            logIfChanged(consulta, "Evaluación: Ánimo", evaluacion.getAnimo(), evalDto.getAnimo(), currentUser);
            logIfChanged(consulta, "Evaluación: Afecto", evaluacion.getAfecto(), evalDto.getAfecto(), currentUser);
            logIfChanged(consulta, "Evaluación: Pensamiento", evaluacion.getPensamiento(), evalDto.getPensamiento(), currentUser);
            logIfChanged(consulta, "Evaluación: Sensopercepción", evaluacion.getSensopercepcion(), evalDto.getSensopercepcion(), currentUser);
            logIfChanged(consulta, "Evaluación: Juicio", evaluacion.getJuicio(), evalDto.getJuicio(), currentUser);
            logIfChanged(consulta, "Evaluación: Memoria", evaluacion.getMemoria(), evalDto.getMemoria(), currentUser);
            logIfChanged(consulta, "Evaluación: Atención", evaluacion.getAtencion(), evalDto.getAtencion(), currentUser);
            logIfChanged(consulta, "Evaluación: Conciencia", evaluacion.getConciencia(), evalDto.getConciencia(), currentUser);
            logIfChanged(consulta, "Evaluación: Orientación", evaluacion.getOrientacion(), evalDto.getOrientacion(), currentUser);
            logIfChanged(consulta, "Evaluación: Riesgo Suicida", evaluacion.getRiesgoSuicida(), evalDto.getRiesgoSuicida(), currentUser);
            logIfChanged(consulta, "Evaluación: Riesgo Homicida", evaluacion.getRiesgoHomicida(), evalDto.getRiesgoHomicida(), currentUser);
            logIfChanged(consulta, "Evaluación: Riesgo Propio", evaluacion.getRiesgoPropio(), evalDto.getRiesgoPropio(), currentUser);
            logIfChanged(consulta, "Evaluación: Eje I", evaluacion.getEje1(), evalDto.getEje1(), currentUser);
            logIfChanged(consulta, "Evaluación: Eje II", evaluacion.getEje2(), evalDto.getEje2(), currentUser);
            logIfChanged(consulta, "Evaluación: Eje III", evaluacion.getEje3(), evalDto.getEje3(), currentUser);
            logIfChanged(consulta, "Evaluación: Adherencia al Tratamiento", evaluacion.getAdherenciaTratamiento(), evalDto.getAdherenciaTratamiento(), currentUser);
            logIfChanged(consulta, "Evaluación: Efectos Adversos", evaluacion.getEfectosAdversos(), evalDto.getEfectosAdversos(), currentUser);

            evaluacionMapper.updateEntityFromDTO(evalDto, evaluacion);
        }

        // Medicación estructurada: se audita como un solo campo (texto legible
        // antes/después), aunque internamente sea una lista — reutiliza el
        // mismo hash-chain que el resto de los campos, sin duplicar lógica.
        String medicacionAnterior = describirMedicaciones(obtenerMedicaciones(id));
        String medicacionNueva = describirMedicaciones(dto.getMedicaciones());
        logIfChanged(consulta, "Medicación (estructurada)", medicacionAnterior, medicacionNueva, currentUser);

        Consulta actualizada = consultaRepository.save(consulta);
        guardarMedicaciones(actualizada, dto.getMedicaciones());

        ConsultaResponseDTO response = consultaMapper.toResponseDTO(actualizada);
        response.setMedicaciones(obtenerMedicaciones(id));
        return response;
    }

    /**
     * `synchronized`: arma la cadena de integridad (lee el último hash de la
     * tabla, calcula el siguiente, guarda) — con una sola instancia de la
     * app, esto alcanza para que dos cambios simultáneos no lean el mismo
     * "último hash" y rompan el encadenado. Ver security.HashChainUtil.
     */
    private synchronized void logIfChanged(Consulta consulta, String campo, Object oldValue, Object newValue, String user) {
        String oldStr = oldValue != null ? String.valueOf(oldValue) : null;
        String newStr = newValue != null ? String.valueOf(newValue) : null;

        if (!Objects.equals(oldStr, newStr)) {
            // Si ambos son null o vacíos, no loguear
            if ((oldStr == null || oldStr.isBlank()) && (newStr == null || newStr.isBlank())) {
                return;
            }
            ConsultaAuditLog log = new ConsultaAuditLog(consulta, campo, oldStr, newStr, user);

            String hashAnterior = consultaAuditLogRepository.findFirstByOrderByIdDesc()
                    .map(ConsultaAuditLog::getHash)
                    .orElse(com.consultorio.security.HashChainUtil.GENESIS);
            log.setHashAnterior(hashAnterior);
            log.setHash(com.consultorio.security.HashChainUtil.siguienteHash(hashAnterior,
                    campo, oldStr, newStr, log.getFechaCambio().toString(), user));

            consultaAuditLogRepository.save(log);
        }
    }

    @Transactional(readOnly = true)
    public List<com.consultorio.dto.ConsultaAuditLogDTO> obtenerHistorialCambios(Long consultaId) {
        List<ConsultaAuditLog> logs = consultaAuditLogRepository.findByConsultaIdOrderByFechaCambioDesc(consultaId);
        return logs.stream()
                .map(log -> new com.consultorio.dto.ConsultaAuditLogDTO(
                        log.getId(),
                        log.getCampo(),
                        log.getValorAnterior(),
                        log.getValorNuevo(),
                        log.getFechaCambio(),
                        log.getModificadoPor()))
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Recorre toda la tabla de auditoría de consultas en orden de inserción
     * y recalcula cada hash a partir de sus datos y el hash guardado en la
     * fila anterior, comparando contra el hash que quedó guardado. Si algo
     * fue editado o borrado directamente en la base (por fuera de la app),
     * la cadena se rompe a partir de esa fila y queda detectado acá.
     */
    @Transactional(readOnly = true)
    public com.consultorio.dto.VerificacionCadenaDTO verificarCadenaAuditoria() {
        List<ConsultaAuditLog> registros = consultaAuditLogRepository.findAllByOrderByIdAsc();

        String hashEsperado = com.consultorio.security.HashChainUtil.GENESIS;
        for (ConsultaAuditLog registro : registros) {
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
     * la tabla, en orden de inserción — uso único, pensado para activar el
     * encadenado sobre una tabla que ya tenía registros de auditoría antes
     * de que existiera esta funcionalidad (su hash queda en null y por eso
     * la verificación siempre los reporta como "rotos"). Es idempotente: se
     * puede correr más de una vez sin cambiar el resultado, porque siempre
     * recalcula la cadena completa a partir de los datos reales ya
     * guardados — no inventa contenido, solo le aplica la fórmula de hash
     * retroactivamente. Solo ADMIN, ver ConsultaController.
     */
    @Transactional
    public com.consultorio.dto.VerificacionCadenaDTO backfillCadenaAuditoria() {
        List<ConsultaAuditLog> registros = consultaAuditLogRepository.findAllByOrderByIdAsc();

        String hashAnterior = com.consultorio.security.HashChainUtil.GENESIS;
        for (ConsultaAuditLog registro : registros) {
            String hash = com.consultorio.security.HashChainUtil.siguienteHash(hashAnterior,
                    registro.getCampo(), registro.getValorAnterior(), registro.getValorNuevo(),
                    registro.getFechaCambio().toString(), registro.getModificadoPor());
            registro.setHashAnterior(hashAnterior);
            registro.setHash(hash);
            hashAnterior = hash;
        }
        consultaAuditLogRepository.saveAll(registros);

        return verificarCadenaAuditoria();
    }

    @Transactional(readOnly = true)
    public ConsultaResponseDTO obtenerUltimaConsulta(Long pacienteId) {
        var resultado = consultaRepository.findFirstByPacienteIdAndActiveTrueOrderByFechaConsultaDesc(pacienteId)
                .map(consultaMapper::toResponseDTO)
                .orElse(null);

        // Auditar solo si encontró consulta
        if (resultado != null) {
            accessLogService.registrar(pacienteId, AccessLogService.VER_CONSULTA, "Última consulta");
        }
        return resultado;
    }
}
