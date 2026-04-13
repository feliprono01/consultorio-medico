package com.consultorio.repository;

import com.consultorio.model.HistoriaPsiquiatrica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HistoriaPsiquiatricaRepository extends JpaRepository<HistoriaPsiquiatrica, Long> {
    Optional<HistoriaPsiquiatrica> findByPacienteId(Long pacienteId);
}
