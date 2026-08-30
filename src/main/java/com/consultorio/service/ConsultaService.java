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
            validarFundamentacionRiesgo(dto.getEvaluacionPsiquiatrica());
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
            medicacionRepository.save(new com.consultorio.model.Medicacion(consulta, m.getFarmaco(), m.getDosis(),
                    m.getFrecuencia(), m.getViaAdministracion(), m.getDuracionPrevista()));
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
            if (m.getViaAdministracion() != null && !m.getViaAdministracion().isBlank()) sb.append(" (").append(m.getViaAdministracion()).append(")");
            if (m.getDuracionPrevista() != null && !m.getDuracionPrevista().isBlank()) sb.append(" - ").append(m.getDuracionPrevista());
        }
        return sb.length() > 0 ? sb.toString() : null;
    }

    private List<com.consultorio.dto.MedicacionDTO> obtenerMedicaciones(Long consultaId) {
        return medicacionRepository.findByConsultaIdOrderByIdAsc(consultaId).stream()
                .map(m -> new com.consultorio.dto.MedicacionDTO(m.getId(), m.getFarmaco(), m.getDosis(),
                        m.getFrecuencia(), m.getViaAdministracion(), m.getDuracionPrevista()))
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
                .findTop500ByActiveTrueOrderByFechaConsultaDesc(PageRequest.of(0, 500))
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

    /**
     * Soft-delete — pensado solo para limpieza de datos de prueba o
     * duplicados genuinos por error de carga, NO como sustituto de
     * `corregirConsulta`. Bajo el modelo append-only, un registro clínico
     * real nunca debería borrarse: si algo está mal, se corrige (queda la
     * versión vieja Y la nueva, ambas visibles) en vez de desaparecer.
     */
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

    /**
     * Corrige una consulta ya guardada — modelo append-only (Ley 26.657 / guía
     * de HCE psiquiátrica): la fila original de `id` NUNCA se modifica, ni un
     * solo UPDATE sobre sus columnas clínicas. En vez de eso, se crea una
     * fila completamente nueva (misma fecha_consulta — sigue siendo la misma
     * visita, corregida) que apunta a la original vía `correccionDeId`. La
     * original queda visible para siempre en la cadena de versiones; los
     * listados normales solo muestran la más nueva (ver ConsultaRepository).
     *
     * Reemplaza a lo que antes era `actualizarConsulta` (edición en el
     * lugar) — ese enfoque auditaba bien los cambios, pero seguía
     * sobreescribiendo el registro original, que es justo lo que la ley
     * prohíbe para evoluciones ya firmadas.
     */
    @Transactional
    public ConsultaResponseDTO corregirConsulta(Long id, ConsultaRequestDTO dto) {
        Consulta original = consultaRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new com.consultorio.exception.ResourceNotFoundException("Consulta", "id", id));

        // Concurrencia: si ya existe una fila que corrige a esta, alguien se
        // adelantó — no se puede corregir "a ciegas" una versión que ya dejó
        // de ser la vigente (mismo espíritu que el chequeo de @Version de
        // antes, adaptado al modelo append-only).
        if (consultaRepository.existsByCorreccionDeId(id)) {
            throw new org.springframework.orm.ObjectOptimisticLockingFailureException(Consulta.class, id);
        }

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        // Arma la fila nueva reusando el mapper de creación — mismos campos,
        // misma validación — y la ata a la original.
        Consulta correccion = consultaMapper.toEntity(dto, original.getPaciente());
        correccion.setFechaConsulta(original.getFechaConsulta());
        correccion.setCorreccionDeId(id);

        com.consultorio.model.EvaluacionPsiquiatrica evalOriginal = original.getEvaluacionPsiquiatrica();
        if (dto.getEvaluacionPsiquiatrica() != null) {
            validarFundamentacionRiesgo(dto.getEvaluacionPsiquiatrica());
            com.consultorio.model.EvaluacionPsiquiatrica nuevaEvaluacion =
                    evaluacionMapper.toEntity(dto.getEvaluacionPsiquiatrica());
            nuevaEvaluacion.setConsulta(correccion);
            correccion.setEvaluacionPsiquiatrica(nuevaEvaluacion);
        }

        Consulta guardada = consultaRepository.save(correccion);
        guardarMedicaciones(guardada, dto.getMedicaciones());

        // Auditoría: compara la ORIGINAL contra la corrección recién guardada,
        // y cada registro de auditoría queda asociado a la fila nueva (que ya
        // tiene id). Mismo hash-chain de siempre, sin tocarlo.
        var evalDto = dto.getEvaluacionPsiquiatrica();
        logIfChanged(guardada, "Motivo", original.getMotivo(), dto.getMotivo(), currentUser);
        logIfChanged(guardada, "Diagnóstico", original.getDiagnostico(), dto.getDiagnostico(), currentUser);
        logIfChanged(guardada, "Diagnóstico CIE-10", original.getDiagnosticoCie10(), dto.getDiagnosticoCie10(), currentUser);
        logIfChanged(guardada, "Tratamiento", original.getTratamiento(), dto.getTratamiento(), currentUser);
        logIfChanged(guardada, "Notas", original.getNotas(), dto.getNotas(), currentUser);
        logIfChanged(guardada, "Estado Ánimo", original.getEstadoAnimo(), dto.getEstadoAnimo(), currentUser);
        logIfChanged(guardada, "Calidad Sueño", original.getCalidadSueno(), dto.getCalidadSueno(), currentUser);
        logIfChanged(guardada, "Alimentación", original.getAlimentacion(), dto.getAlimentacion(), currentUser);
        logIfChanged(guardada, "Sociabilidad", original.getSociabilidad(), dto.getSociabilidad(), currentUser);
        logIfChanged(guardada, "Funcionalidad Laboral", original.getFuncionalidadLaboral(), dto.getFuncionalidadLaboral(), currentUser);
        logIfChanged(guardada, "Funcionalidad Social", original.getFuncionalidadSocial(), dto.getFuncionalidadSocial(), currentUser);
        logIfChanged(guardada, "Funcionalidad Familiar", original.getFuncionalidadFamiliar(), dto.getFuncionalidadFamiliar(), currentUser);

        if (evalDto != null) {
            logIfChanged(guardada, "Evaluación: Apariencia", evalOriginal == null ? null : evalOriginal.getApariencia(), evalDto.getApariencia(), currentUser);
            logIfChanged(guardada, "Evaluación: Conducta", evalOriginal == null ? null : evalOriginal.getConducta(), evalDto.getConducta(), currentUser);
            logIfChanged(guardada, "Evaluación: Lenguaje", evalOriginal == null ? null : evalOriginal.getLenguaje(), evalDto.getLenguaje(), currentUser);
            logIfChanged(guardada, "Evaluación: Ánimo", evalOriginal == null ? null : evalOriginal.getAnimo(), evalDto.getAnimo(), currentUser);
            logIfChanged(guardada, "Evaluación: Afecto", evalOriginal == null ? null : evalOriginal.getAfecto(), evalDto.getAfecto(), currentUser);
            logIfChanged(guardada, "Evaluación: Pensamiento", evalOriginal == null ? null : evalOriginal.getPensamiento(), evalDto.getPensamiento(), currentUser);
            logIfChanged(guardada, "Evaluación: Sensopercepción", evalOriginal == null ? null : evalOriginal.getSensopercepcion(), evalDto.getSensopercepcion(), currentUser);
            logIfChanged(guardada, "Evaluación: Juicio", evalOriginal == null ? null : evalOriginal.getJuicio(), evalDto.getJuicio(), currentUser);
            logIfChanged(guardada, "Evaluación: Memoria", evalOriginal == null ? null : evalOriginal.getMemoria(), evalDto.getMemoria(), currentUser);
            logIfChanged(guardada, "Evaluación: Atención", evalOriginal == null ? null : evalOriginal.getAtencion(), evalDto.getAtencion(), currentUser);
            logIfChanged(guardada, "Evaluación: Conciencia", evalOriginal == null ? null : evalOriginal.getConciencia(), evalDto.getConciencia(), currentUser);
            logIfChanged(guardada, "Evaluación: Orientación", evalOriginal == null ? null : evalOriginal.getOrientacion(), evalDto.getOrientacion(), currentUser);
            logIfChanged(guardada, "Evaluación: Riesgo Suicida", evalOriginal == null ? null : evalOriginal.getRiesgoSuicida(), evalDto.getRiesgoSuicida(), currentUser);
            logIfChanged(guardada, "Evaluación: Riesgo Homicida", evalOriginal == null ? null : evalOriginal.getRiesgoHomicida(), evalDto.getRiesgoHomicida(), currentUser);
            logIfChanged(guardada, "Evaluación: Riesgo Propio", evalOriginal == null ? null : evalOriginal.getRiesgoPropio(), evalDto.getRiesgoPropio(), currentUser);
            logIfChanged(guardada, "Evaluación: Fundamentación de Riesgo", evalOriginal == null ? null : evalOriginal.getFundamentacionRiesgo(), evalDto.getFundamentacionRiesgo(), currentUser);
            logIfChanged(guardada, "Evaluación: Eje I", evalOriginal == null ? null : evalOriginal.getEje1(), evalDto.getEje1(), currentUser);
            logIfChanged(guardada, "Evaluación: Eje II", evalOriginal == null ? null : evalOriginal.getEje2(), evalDto.getEje2(), currentUser);
            logIfChanged(guardada, "Evaluación: Eje III", evalOriginal == null ? null : evalOriginal.getEje3(), evalDto.getEje3(), currentUser);
            logIfChanged(guardada, "Evaluación: Adherencia al Tratamiento", evalOriginal == null ? null : evalOriginal.getAdherenciaTratamiento(), evalDto.getAdherenciaTratamiento(), currentUser);
            logIfChanged(guardada, "Evaluación: Efectos Adversos", evalOriginal == null ? null : evalOriginal.getEfectosAdversos(), evalDto.getEfectosAdversos(), currentUser);
        }

        String medicacionAnterior = describirMedicaciones(obtenerMedicaciones(id));
        String medicacionNueva = describirMedicaciones(dto.getMedicaciones());
        logIfChanged(guardada, "Medicación (estructurada)", medicacionAnterior, medicacionNueva, currentUser);

        ConsultaResponseDTO response = consultaMapper.toResponseDTO(guardada);
        response.setMedicaciones(obtenerMedicaciones(guardada.getId()));
        response.setCorregida(false);
        return response;
    }

    /**
     * Recorre toda la cadena de versiones de una consulta (original +
     * correcciones), de la más vieja a la más nueva — para mostrarle al
     * médico "así se veía antes de cada corrección". `id` puede ser
     * cualquier eslabón de la cadena, no hace falta que sea el original.
     */
    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> obtenerCadenaVersiones(Long id) {
        Consulta actual = consultaRepository.findById(id)
                .orElseThrow(() -> new com.consultorio.exception.ResourceNotFoundException("Consulta", "id", id));

        // Retroceder hasta el original de la cadena.
        Consulta raiz = actual;
        while (raiz.getCorreccionDeId() != null) {
            Long idAnterior = raiz.getCorreccionDeId();
            raiz = consultaRepository.findById(idAnterior)
                    .orElseThrow(() -> new com.consultorio.exception.ResourceNotFoundException(
                            "Consulta", "id", idAnterior));
        }

        // Avanzar desde el original juntando cada corrección posterior.
        List<Consulta> cadena = new java.util.ArrayList<>();
        cadena.add(raiz);
        Consulta cursor = raiz;
        while (consultaRepository.existsByCorreccionDeId(cursor.getId())) {
            cursor = consultaRepository.findByCorreccionDeId(cursor.getId()).orElseThrow();
            cadena.add(cursor);
        }

        List<ConsultaResponseDTO> resultado = new java.util.ArrayList<>();
        for (int i = 0; i < cadena.size(); i++) {
            Consulta version = cadena.get(i);
            ConsultaResponseDTO dto = consultaMapper.toResponseDTO(version);
            dto.setMedicaciones(obtenerMedicaciones(version.getId()));
            dto.setCorregida(i < cadena.size() - 1); // todas menos la última ya fueron superadas
            resultado.add(dto);
        }
        return resultado;
    }

    /**
     * Ley 26.657: cualquier intervención en crisis o riesgo relevante exige
     * fundamentación técnica explícita, no alcanza con marcar un nivel de
     * riesgo. Rechaza (400, no 500 — mismo patrón que el resto de las
     * validaciones de negocio) si algún riesgo es "Alto"/"Inminente" sin
     * texto en fundamentacionRiesgo.
     */
    private void validarFundamentacionRiesgo(com.consultorio.dto.EvaluacionPsiquiatricaDTO evalDto) {
        // riesgoPropio usa otro vocabulario ("Grave", no "Alto"/"Inminente") —
        // ver PsychiatricEvaluationFields.jsx.
        boolean riesgoAlto = java.util.List.of("Alto", "Inminente").contains(evalDto.getRiesgoSuicida())
                || java.util.List.of("Alto", "Inminente").contains(evalDto.getRiesgoHomicida())
                || "Grave".equals(evalDto.getRiesgoPropio());
        if (riesgoAlto && (evalDto.getFundamentacionRiesgo() == null || evalDto.getFundamentacionRiesgo().isBlank())) {
            throw new IllegalArgumentException(
                    "Un riesgo marcado como Alto o Inminente requiere fundamentación técnica del riesgo.");
        }
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
        var resultado = consultaRepository.findFirstByPacienteIdAndActiveTrueOrderByFechaConsultaDesc(
                        pacienteId, PageRequest.of(0, 1))
                .stream().findFirst()
                .map(consultaMapper::toResponseDTO)
                .orElse(null);

        // Auditar solo si encontró consulta
        if (resultado != null) {
            accessLogService.registrar(pacienteId, AccessLogService.VER_CONSULTA, "Última consulta");
        }
        return resultado;
    }
}
