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
    private final com.consultorio.mapper.ConsultaMapper consultaMapper;

    @Transactional
    public ConsultaResponseDTO crearConsulta(ConsultaRequestDTO dto) {
        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new com.consultorio.exception.ResourceNotFoundException("Paciente", "id",
                        dto.getPacienteId()));

        Consulta consulta = consultaMapper.toEntity(dto, paciente);

        if (consulta.getFechaConsulta() == null) {
            consulta.setFechaConsulta(LocalDateTime.now());
        }

        // Manejo de Evaluación Psiquiátrica
        if (dto.getEvaluacionPsiquiatrica() != null) {
            com.consultorio.model.EvaluacionPsiquiatrica evaluacion = new com.consultorio.model.EvaluacionPsiquiatrica();
            evaluacion.setApariencia(dto.getEvaluacionPsiquiatrica().getApariencia());
            evaluacion.setConducta(dto.getEvaluacionPsiquiatrica().getConducta());
            evaluacion.setLenguaje(dto.getEvaluacionPsiquiatrica().getLenguaje());
            evaluacion.setAnimo(dto.getEvaluacionPsiquiatrica().getAnimo());
            evaluacion.setAfecto(dto.getEvaluacionPsiquiatrica().getAfecto());
            evaluacion.setPensamiento(dto.getEvaluacionPsiquiatrica().getPensamiento());
            evaluacion.setSensopercepcion(dto.getEvaluacionPsiquiatrica().getSensopercepcion());
            evaluacion.setJuicio(dto.getEvaluacionPsiquiatrica().getJuicio());
            evaluacion.setMemoria(dto.getEvaluacionPsiquiatrica().getMemoria());
            evaluacion.setAtencion(dto.getEvaluacionPsiquiatrica().getAtencion());
            evaluacion.setConciencia(dto.getEvaluacionPsiquiatrica().getConciencia());
            evaluacion.setRiesgoSuicida(dto.getEvaluacionPsiquiatrica().getRiesgoSuicida());
            evaluacion.setRiesgoHomicida(dto.getEvaluacionPsiquiatrica().getRiesgoHomicida());
            evaluacion.setRiesgoPropio(dto.getEvaluacionPsiquiatrica().getRiesgoPropio());
            evaluacion.setEje1(dto.getEvaluacionPsiquiatrica().getEje1());
            evaluacion.setEje2(dto.getEvaluacionPsiquiatrica().getEje2());
            evaluacion.setEje3(dto.getEvaluacionPsiquiatrica().getEje3());
            evaluacion.setAdherenciaTratamiento(dto.getEvaluacionPsiquiatrica().getAdherenciaTratamiento());
            evaluacion.setEfectosAdversos(dto.getEvaluacionPsiquiatrica().getEfectosAdversos());
            evaluacion.setConsulta(consulta);
            consulta.setEvaluacionPsiquiatrica(evaluacion);
        }

        Consulta guardada = consultaRepository.save(consulta);
        return consultaMapper.toResponseDTO(guardada);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> obtenerHistorial(Long pacienteId) {
        if (!pacienteRepository.existsById(pacienteId)) {
            throw new com.consultorio.exception.ResourceNotFoundException("Paciente", "id", pacienteId);
        }

        List<Consulta> consultas = consultaRepository.findByPacienteIdAndActiveTrueOrderByFechaConsultaDesc(pacienteId);
        return consultaMapper.toResponseDTOList(consultas);
    }

    @Transactional(readOnly = true)
    public List<ConsultaResponseDTO> obtenerTodas() {
        List<Consulta> consultas = consultaRepository.findByActiveTrueOrderByFechaConsultaDesc();
        return consultaMapper.toResponseDTOList(consultas);
    }

    @Transactional
    public void eliminarConsulta(Long id) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new com.consultorio.exception.ResourceNotFoundException("Consulta", "id", id));
        consulta.softDelete();
        consultaRepository.save(consulta);
    }

    @Transactional(readOnly = true)
    public ConsultaResponseDTO obtenerPorId(Long id) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new com.consultorio.exception.ResourceNotFoundException("Consulta", "id", id));
        return consultaMapper.toResponseDTO(consulta);
    }

    @Transactional
    public ConsultaResponseDTO actualizarConsulta(Long id, ConsultaRequestDTO dto) {
        Consulta consulta = consultaRepository.findById(id)
                .orElseThrow(() -> new com.consultorio.exception.ResourceNotFoundException("Consulta", "id", id));

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        // Actualizar datos de consulta general con auditoría
        logIfChanged(consulta, "Motivo", consulta.getMotivo(), dto.getMotivo(), currentUser);
        consulta.setMotivo(dto.getMotivo());

        consulta.setMotivoConsulta(dto.getMotivo()); // Legacy field support

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

        // Actualizar o crear Evaluación Psiquiátrica
        if (dto.getEvaluacionPsiquiatrica() != null) {
            com.consultorio.model.EvaluacionPsiquiatrica evaluacion = consulta.getEvaluacionPsiquiatrica();
            if (evaluacion == null) {
                evaluacion = new com.consultorio.model.EvaluacionPsiquiatrica();
                evaluacion.setConsulta(consulta);
                consulta.setEvaluacionPsiquiatrica(evaluacion);
            }

            // Auditoría básica de evaluación (podríamos detallar campo por campo si fuera
            // necesario)
            // Por simplicidad en MVP, auditamos cambios significativos o campos clave
            // Aquí un ejemplo de cómo auditar campos de la evaluación:
            logIfChanged(consulta, "Evaluación: Apariencia", evaluacion.getApariencia(),
                    dto.getEvaluacionPsiquiatrica().getApariencia(), currentUser);
            // ... Repetir para otros campos si se requiere granularidad extrema

            // Actualizar campos
            evaluacion.setApariencia(dto.getEvaluacionPsiquiatrica().getApariencia());
            evaluacion.setConducta(dto.getEvaluacionPsiquiatrica().getConducta());
            evaluacion.setLenguaje(dto.getEvaluacionPsiquiatrica().getLenguaje());
            evaluacion.setAnimo(dto.getEvaluacionPsiquiatrica().getAnimo());
            evaluacion.setAfecto(dto.getEvaluacionPsiquiatrica().getAfecto());
            evaluacion.setPensamiento(dto.getEvaluacionPsiquiatrica().getPensamiento());
            evaluacion.setSensopercepcion(dto.getEvaluacionPsiquiatrica().getSensopercepcion());
            evaluacion.setJuicio(dto.getEvaluacionPsiquiatrica().getJuicio());
            evaluacion.setMemoria(dto.getEvaluacionPsiquiatrica().getMemoria());
            evaluacion.setAtencion(dto.getEvaluacionPsiquiatrica().getAtencion());
            evaluacion.setConciencia(dto.getEvaluacionPsiquiatrica().getConciencia());
            evaluacion.setRiesgoSuicida(dto.getEvaluacionPsiquiatrica().getRiesgoSuicida());
            evaluacion.setRiesgoHomicida(dto.getEvaluacionPsiquiatrica().getRiesgoHomicida());
            evaluacion.setRiesgoPropio(dto.getEvaluacionPsiquiatrica().getRiesgoPropio());
            evaluacion.setEje1(dto.getEvaluacionPsiquiatrica().getEje1());
            evaluacion.setEje2(dto.getEvaluacionPsiquiatrica().getEje2());
            evaluacion.setEje3(dto.getEvaluacionPsiquiatrica().getEje3());
            evaluacion.setAdherenciaTratamiento(dto.getEvaluacionPsiquiatrica().getAdherenciaTratamiento());
            evaluacion.setEfectosAdversos(dto.getEvaluacionPsiquiatrica().getEfectosAdversos());
        }

        Consulta actualizada = consultaRepository.save(consulta);
        return consultaMapper.toResponseDTO(actualizada);
    }

    private void logIfChanged(Consulta consulta, String campo, Object oldValue, Object newValue, String user) {
        String oldStr = oldValue != null ? String.valueOf(oldValue) : null;
        String newStr = newValue != null ? String.valueOf(newValue) : null;

        if (!Objects.equals(oldStr, newStr)) {
            // Si ambos son null o vacíos, no loguear
            if ((oldStr == null || oldStr.isBlank()) && (newStr == null || newStr.isBlank())) {
                return;
            }
            ConsultaAuditLog log = new ConsultaAuditLog(consulta, campo, oldStr, newStr, user);
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

    @Transactional(readOnly = true)
    public ConsultaResponseDTO obtenerUltimaConsulta(Long pacienteId) {
        return consultaRepository.findFirstByPacienteIdAndActiveTrueOrderByFechaConsultaDesc(pacienteId)
                .map(consultaMapper::toResponseDTO)
                .orElse(null);
    }
}
