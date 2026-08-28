package com.consultorio.integration;

import com.consultorio.dto.AuthRequestDTO;
import com.consultorio.dto.ConsultaRequestDTO;
import com.consultorio.model.Paciente;
import com.consultorio.model.Role;
import com.consultorio.model.Usuario;
import com.consultorio.repository.ConsultaRepository;
import com.consultorio.repository.PacienteRepository;
import com.consultorio.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Verifica el encadenado de integridad (hash chain) de la auditoría de
 * consultas: que se arma correctamente al editar, que la verificación la
 * confirma intacta, y que si alguien altera un registro directamente en la
 * base de datos (por fuera de la aplicación) la verificación lo detecta.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuditChainIntegrityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private ConsultaRepository consultaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    private Paciente testPaciente;

    @BeforeEach
    void setUp() {
        usuarioRepository.save(Usuario.builder()
                .username("doctor.chain").password(passwordEncoder.encode("Password123!"))
                .nombre("Doctor").apellido("Chain").role(Role.USER).build());

        usuarioRepository.save(Usuario.builder()
                .username("admin.chain").password(passwordEncoder.encode("Password123!"))
                .nombre("Admin").apellido("Chain").role(Role.ADMIN).build());

        testPaciente = pacienteRepository.save(Paciente.builder()
                .nombre("Paciente").apellido("Cadena").dni("55566677")
                .fechaNacimiento(LocalDate.of(1985, 5, 5)).active(true).build());
    }

    private Cookie login(String username) throws Exception {
        AuthRequestDTO login = new AuthRequestDTO();
        login.setUsername(username);
        login.setPassword("Password123!");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();
        return result.getResponse().getCookie("jwt_token");
    }

    @Test
    void cadenaQuedaIntactaTrasVariasEdicionesYSeDetectaSiSeAlteraDirectoEnLaBase() throws Exception {
        Cookie doctorCookie = login("doctor.chain");

        ConsultaRequestDTO crear = new ConsultaRequestDTO();
        crear.setPacienteId(testPaciente.getId());
        crear.setMotivo("Motivo inicial");

        MvcResult creado = mockMvc.perform(post("/api/consultas")
                        .cookie(doctorCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crear)))
                .andExpect(status().isCreated())
                .andReturn();
        var creadoJson = objectMapper.readTree(creado.getResponse().getContentAsString());
        Long consultaId = creadoJson.get("id").asLong();
        long version = creadoJson.get("version").asLong();

        // Dos ediciones más, cada una debería sumar un eslabón a la cadena.
        // Todo el test comparte una sola transacción (@Transactional de
        // JUnit, para el rollback automático al final), así que hay que
        // forzar el flush entre requests para que la versión incrementada
        // por el @Version de la primera actualización sea visible para la
        // segunda — igual patrón que usa EvaluacionPsiquiatricaEncryptionTest.
        for (String motivo : new String[] { "Motivo editado 1", "Motivo editado 2" }) {
            ConsultaRequestDTO actualizar = new ConsultaRequestDTO();
            actualizar.setPacienteId(testPaciente.getId());
            actualizar.setMotivo(motivo);
            actualizar.setVersion(version);
            mockMvc.perform(put("/api/consultas/" + consultaId)
                            .cookie(doctorCookie)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(actualizar)))
                    .andExpect(status().isOk());

            entityManager.flush();
            entityManager.clear();
            version = consultaRepository.findById(consultaId).orElseThrow().getVersion();
        }

        Cookie adminCookie = login("admin.chain");

        // 1. La cadena debe estar intacta después de las ediciones normales.
        mockMvc.perform(get("/api/consultas/auditoria/verificar-cadena").cookie(adminCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intacta").value(true))
                .andExpect(jsonPath("$.primerRegistroRoto").doesNotExist());

        // 2. Un usuario sin rol ADMIN no puede consultar la verificación.
        mockMvc.perform(get("/api/consultas/auditoria/verificar-cadena").cookie(doctorCookie))
                .andExpect(status().isForbidden());

        // 3. Simulamos un atacante con acceso directo a la base: cambia quién
        // figura como autor de un cambio ya guardado, sin pasar por la app.
        Long idAlterado = jdbcTemplate.queryForObject(
                "SELECT id FROM consulta_audit_logs WHERE consulta_id = ? ORDER BY id ASC LIMIT 1",
                Long.class, consultaId);
        jdbcTemplate.update("UPDATE consulta_audit_logs SET modificado_por = ? WHERE id = ?",
                "alguien.mas", idAlterado);
        // El SQL directo no pasa por el EntityManager de esta transacción —
        // hay que limpiar su caché de primer nivel para que la próxima
        // lectura vea el dato alterado en vez de la entidad ya cacheada.
        entityManager.clear();

        // 4. La verificación ahora debe detectar la ruptura, señalando ese registro.
        mockMvc.perform(get("/api/consultas/auditoria/verificar-cadena").cookie(adminCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intacta").value(false))
                .andExpect(jsonPath("$.primerRegistroRoto").value(idAlterado));
    }
}
