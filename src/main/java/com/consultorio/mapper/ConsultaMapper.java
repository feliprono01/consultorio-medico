package com.consultorio.mapper;

import com.consultorio.dto.ConsultaRequestDTO;
import com.consultorio.dto.ConsultaResponseDTO;
import com.consultorio.model.Consulta;
import com.consultorio.model.Paciente;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ConsultaMapper {

    /**
     * Convierte un ConsultaRequestDTO y una entidad Paciente a una entidad
     * Consulta.
     * La fecha de consulta se asigna manualmente o por defecto si es necesaria.
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "fechaConsulta", ignore = true) // Se asigna en el servicio si es necesario
    @Mapping(target = "paciente", source = "paciente")
    @Mapping(target = "motivo", source = "dto.motivo")
    @Mapping(target = "motivoConsulta", source = "dto.motivo")
    @Mapping(target = "diagnostico", source = "dto.diagnostico")
    @Mapping(target = "tratamiento", source = "dto.tratamiento")
    @Mapping(target = "notas", source = "dto.notas")
    @Mapping(target = "estadoAnimo", source = "dto.estadoAnimo")
    @Mapping(target = "calidadSueno", source = "dto.calidadSueno")
    @Mapping(target = "evaluacionPsiquiatrica", ignore = true) // Handled separately
    Consulta toEntity(ConsultaRequestDTO dto, Paciente paciente);

    /**
     * Convierte una entidad Consulta a ConsultaResponseDTO.
     */
    @Mapping(target = "pacienteId", source = "paciente.id")
    @Mapping(target = "nombrePaciente", source = "paciente.nombre")
    @Mapping(target = "apellidoPaciente", source = "paciente.apellido")
    @Mapping(target = "dniPaciente", source = "paciente.dni")
    @Mapping(target = "evaluacionPsiquiatrica", source = "evaluacionPsiquiatrica")
    ConsultaResponseDTO toResponseDTO(Consulta consulta);

    /**
     * Convierte una lista de entidades Consulta a una lista de ConsultaResponseDTO.
     */
    /**
     * Convierte una lista de entidades Consulta a una lista de ConsultaResponseDTO.
     */
    List<ConsultaResponseDTO> toResponseDTOList(List<Consulta> consultas);

    /**
     * Mapeo manual para EvaluacionPsiquiatrica.
     */
    com.consultorio.dto.EvaluacionPsiquiatricaDTO mapEvaluacion(com.consultorio.model.EvaluacionPsiquiatrica source);
}
