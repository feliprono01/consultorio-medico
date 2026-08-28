package com.consultorio.repository;

import com.consultorio.model.Medicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicacionRepository extends JpaRepository<Medicacion, Long> {

    List<Medicacion> findByConsultaIdOrderByIdAsc(Long consultaId);

    @Modifying
    @Query("DELETE FROM Medicacion m WHERE m.consulta.id = :consultaId")
    void deleteByConsultaId(@Param("consultaId") Long consultaId);
}
