package com.consultorio.repository;

import com.consultorio.model.EvaluacionPsiquiatrica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EvaluacionPsiquiatricaRepository extends JpaRepository<EvaluacionPsiquiatrica, Long> {
    Optional<EvaluacionPsiquiatrica> findByConsultaId(Long consultaId);
}
