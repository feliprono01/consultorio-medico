package com.consultorio.integration;

import com.consultorio.model.Consulta;
import com.consultorio.model.EvaluacionPsiquiatrica;
import com.consultorio.model.Paciente;
import com.consultorio.repository.ConsultaRepository;
import com.consultorio.repository.EvaluacionPsiquiatricaRepository;
import com.consultorio.repository.PacienteRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EvaluacionPsiquiatricaEncryptionTest {

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private EvaluacionPsiquiatricaRepository evaluacionRepository;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void riesgoSuicidaQuedaCifradoEnLaBaseYSeLeeIgualDespues() {
        Paciente paciente = pacienteRepository.save(Paciente.builder()
                .nombre("Paciente").apellido("Cifrado")
                .dni("99988877")
                .fechaNacimiento(LocalDate.of(1980, 1, 1))
                .active(true)
                .build());

        Consulta consulta = new Consulta();
        consulta.setPaciente(paciente);
        consulta.setMotivo("Control");
        consulta.setFechaConsulta(LocalDateTime.now());
        consulta = consultaRepository.save(consulta);

        String textoOriginal = "Paciente refiere ideación suicida activa con plan estructurado.";

        EvaluacionPsiquiatrica evaluacion = new EvaluacionPsiquiatrica();
        evaluacion.setConsulta(consulta);
        evaluacion.setRiesgoSuicida(textoOriginal);
        evaluacion.setApariencia("Adecuada");
        evaluacion = evaluacionRepository.save(evaluacion);

        entityManager.flush();
        entityManager.clear();

        // 1. Vía JPA: el valor se lee igual que se guardó (round-trip transparente).
        EvaluacionPsiquiatrica recargada = evaluacionRepository.findById(evaluacion.getId()).orElseThrow();
        assertThat(recargada.getRiesgoSuicida()).isEqualTo(textoOriginal);

        // 2. Vía SQL crudo: el valor en la columna NO es el texto plano — está cifrado.
        String valorCrudo = jdbcTemplate.queryForObject(
                "SELECT riesgo_suicida FROM evaluaciones_psiquiatricas WHERE id = ?",
                String.class, evaluacion.getId());

        assertThat(valorCrudo).startsWith("ENC:");
        assertThat(valorCrudo).doesNotContain("ideación suicida");
    }
}
