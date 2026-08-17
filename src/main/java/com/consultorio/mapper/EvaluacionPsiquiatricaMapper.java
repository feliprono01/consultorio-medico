package com.consultorio.mapper;

import com.consultorio.dto.EvaluacionPsiquiatricaDTO;
import com.consultorio.model.EvaluacionPsiquiatrica;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Mapper de MapStruct para convertir entre EvaluacionPsiquiatrica y su DTO.
 * Reemplaza el mapeo campo por campo que antes vivía a mano en ConsultaService.
 */
@Mapper(componentModel = "spring")
public interface EvaluacionPsiquiatricaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "consulta", ignore = true)
    EvaluacionPsiquiatrica toEntity(EvaluacionPsiquiatricaDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "consulta", ignore = true)
    void updateEntityFromDTO(EvaluacionPsiquiatricaDTO dto, @MappingTarget EvaluacionPsiquiatrica entity);
}
