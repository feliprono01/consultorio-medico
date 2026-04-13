package com.consultorio.mapper;

import com.consultorio.dto.PacienteRequestDTO;
import com.consultorio.dto.PacienteResponseDTO;
import com.consultorio.model.Paciente;
import org.mapstruct.*;

import java.util.List;

/**
 * Mapper de MapStruct para convertir entre Paciente y sus DTOs.
 * MapStruct genera automáticamente la implementación en tiempo de compilación.
 */
@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))
public interface PacienteMapper {

    /**
     * Convierte un PacienteRequestDTO a una entidad Paciente
     * Se ignoran las consultas ya que se crean por separado
     */
    @Mapping(target = "consultas", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "historiaPsiquiatrica", ignore = true) // Created separately or in specific update
    Paciente toEntity(PacienteRequestDTO dto);

    /**
     * Convierte una entidad Paciente a PacienteResponseDTO
     * Incluye el mapeo del campo calculado nombreCompleto
     */
    @Mapping(target = "nombreCompleto", source = "nombreCompleto")
    @Mapping(target = "edad", ignore = true)
    PacienteResponseDTO toResponseDTO(Paciente paciente);

    /**
     * Convierte una lista de entidades Paciente a una lista de PacienteResponseDTO
     */
    List<PacienteResponseDTO> toResponseDTOList(List<Paciente> pacientes);

    /**
     * Actualiza una entidad Paciente existente con datos de un PacienteRequestDTO
     * Ignora el ID, los campos de auditoría y la lista de consultas
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "consultas", ignore = true)
    @Mapping(target = "historiaPsiquiatrica", ignore = true)
    void updateEntityFromDTO(PacienteRequestDTO dto, @MappingTarget Paciente paciente);
}
