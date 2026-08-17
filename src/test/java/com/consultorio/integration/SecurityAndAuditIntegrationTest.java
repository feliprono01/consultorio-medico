package com.consultorio.integration;

import com.consultorio.dto.AuthRequestDTO;
import com.consultorio.dto.PacienteRequestDTO;
import com.consultorio.model.AccessLog;
import com.consultorio.model.Paciente;
import com.consultorio.model.Role;
import com.consultorio.model.Usuario;
import com.consultorio.repository.AccessLogRepository;
import com.consultorio.repository.PacienteRepository;
import com.consultorio.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityAndAuditIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private AccessLogRepository accessLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Usuario testUser;
    private Paciente testPaciente;

    @BeforeEach
    void setUp() {
        // Crear usuario para pruebas
        testUser = Usuario.builder()
                .username("doctor.test")
                .password(passwordEncoder.encode("Password123!"))
                .nombre("Doctor")
                .apellido("Test")
                .role(Role.USER)
                .build();
        usuarioRepository.save(testUser);

        // Crear paciente para pruebas
        testPaciente = Paciente.builder()
                .nombre("Juan")
                .apellido("Perez")
                .dni("12345678")
                .email("juan@test.com")
                .fechaNacimiento(LocalDate.of(1990, 1, 1))
                .active(true)
                .build();
        pacienteRepository.save(testPaciente);
    }

    @Test
    void testLoginAndLogoutWithBlacklist() throws Exception {
        AuthRequestDTO loginRequest = new AuthRequestDTO();
        loginRequest.setUsername("doctor.test");
        loginRequest.setPassword("Password123!");

        // 1. Login
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("jwt_token"))
                .andReturn();

        Cookie jwtCookie = result.getResponse().getCookie("jwt_token");
        assertThat(jwtCookie).isNotNull();

        // 2. Usar token para acceder a un recurso protegido (debe funcionar)
        mockMvc.perform(get("/api/pacientes/" + testPaciente.getId())
                        .cookie(jwtCookie))
                .andExpect(status().isOk());

        // 3. Logout
        mockMvc.perform(post("/api/auth/logout")
                        .cookie(jwtCookie))
                .andExpect(status().isNoContent())
                .andExpect(cookie().value("jwt_token", ""));

        // 4. Intentar usar el token revocado (debe fallar 403 Forbidden)
        mockMvc.perform(get("/api/pacientes/" + testPaciente.getId())
                        .cookie(jwtCookie))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAccessLogIsGenerated() throws Exception {
        AuthRequestDTO loginRequest = new AuthRequestDTO();
        loginRequest.setUsername("doctor.test");
        loginRequest.setPassword("Password123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie jwtCookie = result.getResponse().getCookie("jwt_token");

        // Acceder a la ficha del paciente
        mockMvc.perform(get("/api/pacientes/" + testPaciente.getId())
                        .cookie(jwtCookie))
                .andExpect(status().isOk());

        // Verificar que se creó un registro de auditoría de lectura
        List<AccessLog> logs = accessLogRepository.findAll();
        assertThat(logs).isNotEmpty();
        AccessLog log = logs.get(logs.size() - 1);
        
        assertThat(log.getUsuario()).isEqualTo("doctor.test");
        assertThat(log.getPacienteId()).isEqualTo(testPaciente.getId());
        assertThat(log.getAccion()).isEqualTo("VER_FICHA");
    }

    @Test
    void testAuthMeConfirmaSesionValidaYRechazaSinCookie() throws Exception {
        AuthRequestDTO loginRequest = new AuthRequestDTO();
        loginRequest.setUsername("doctor.test");
        loginRequest.setPassword("Password123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie jwtCookie = result.getResponse().getCookie("jwt_token");

        mockMvc.perform(get("/api/auth/me").cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("USER"));

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testExportarPdfQuedaRegistradoEnAuditoria() throws Exception {
        AuthRequestDTO loginRequest = new AuthRequestDTO();
        loginRequest.setUsername("doctor.test");
        loginRequest.setPassword("Password123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie jwtCookie = result.getResponse().getCookie("jwt_token");

        mockMvc.perform(get("/api/pacientes/" + testPaciente.getId() + "/historia-clinica/exportar")
                        .cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));

        List<AccessLog> logs = accessLogRepository.findAll();
        boolean quedoRegistrado = logs.stream().anyMatch(log ->
                log.getPacienteId().equals(testPaciente.getId())
                        && log.getAccion().equals("VER_HISTORIAL")
                        && log.getDetalle() != null
                        && log.getDetalle().contains("Exportación PDF"));

        assertThat(quedoRegistrado).isTrue();
    }

    @Test
    void testSoloAdminPuedeListarBackups() throws Exception {
        // Usuario USER (no admin) — debe ser rechazado
        AuthRequestDTO loginUser = new AuthRequestDTO();
        loginUser.setUsername("doctor.test");
        loginUser.setPassword("Password123!");

        MvcResult userResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginUser)))
                .andExpect(status().isOk())
                .andReturn();

        mockMvc.perform(get("/api/backups").cookie(userResult.getResponse().getCookie("jwt_token")))
                .andExpect(status().isForbidden());

        // Usuario ADMIN — debe poder acceder
        usuarioRepository.save(Usuario.builder()
                .username("admin.backups")
                .password(passwordEncoder.encode("Password123!"))
                .nombre("Admin").apellido("Test").role(Role.ADMIN).build());

        AuthRequestDTO loginAdmin = new AuthRequestDTO();
        loginAdmin.setUsername("admin.backups");
        loginAdmin.setPassword("Password123!");

        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginAdmin)))
                .andExpect(status().isOk())
                .andReturn();

        mockMvc.perform(get("/api/backups").cookie(adminResult.getResponse().getCookie("jwt_token")))
                .andExpect(status().isOk());
    }

    @Test
    void testSoloAdminPuedeListarUsuarios() throws Exception {
        AuthRequestDTO loginUser = new AuthRequestDTO();
        loginUser.setUsername("doctor.test");
        loginUser.setPassword("Password123!");

        MvcResult userResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginUser)))
                .andExpect(status().isOk())
                .andReturn();

        mockMvc.perform(get("/api/users").cookie(userResult.getResponse().getCookie("jwt_token")))
                .andExpect(status().isForbidden());

        usuarioRepository.save(Usuario.builder()
                .username("admin.users")
                .password(passwordEncoder.encode("Password123!"))
                .nombre("Admin").apellido("Test").role(Role.ADMIN).build());

        AuthRequestDTO loginAdmin = new AuthRequestDTO();
        loginAdmin.setUsername("admin.users");
        loginAdmin.setPassword("Password123!");

        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginAdmin)))
                .andExpect(status().isOk())
                .andReturn();

        mockMvc.perform(get("/api/users").cookie(adminResult.getResponse().getCookie("jwt_token")))
                .andExpect(status().isOk());
    }

    @Test
    void testSoloAdminPuedeVerAccessLogs() throws Exception {
        AuthRequestDTO loginUser = new AuthRequestDTO();
        loginUser.setUsername("doctor.test");
        loginUser.setPassword("Password123!");

        MvcResult userResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginUser)))
                .andExpect(status().isOk())
                .andReturn();

        mockMvc.perform(get("/api/access-logs/paciente/" + testPaciente.getId())
                        .cookie(userResult.getResponse().getCookie("jwt_token")))
                .andExpect(status().isForbidden());

        usuarioRepository.save(Usuario.builder()
                .username("admin.accesslogs")
                .password(passwordEncoder.encode("Password123!"))
                .nombre("Admin").apellido("Test").role(Role.ADMIN).build());

        AuthRequestDTO loginAdmin = new AuthRequestDTO();
        loginAdmin.setUsername("admin.accesslogs");
        loginAdmin.setPassword("Password123!");

        MvcResult adminResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginAdmin)))
                .andExpect(status().isOk())
                .andReturn();

        mockMvc.perform(get("/api/access-logs/paciente/" + testPaciente.getId())
                        .cookie(adminResult.getResponse().getCookie("jwt_token")))
                .andExpect(status().isOk());
    }

    @Test
    void testMalformedJwtCookieReturnsCleanErrorNotServerError() throws Exception {
        Cookie tokenMalformado = new Cookie("jwt_token", "esto-no-es-un-jwt-valido");

        mockMvc.perform(get("/api/pacientes/" + testPaciente.getId())
                        .cookie(tokenMalformado))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void testOptimisticLockingOnPacienteUpdate() throws Exception {
        AuthRequestDTO loginRequest = new AuthRequestDTO();
        loginRequest.setUsername("doctor.test");
        loginRequest.setPassword("Password123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie jwtCookie = result.getResponse().getCookie("jwt_token");

        // Crear payload con una versión incorrecta (1, cuando la actual es 0 u otra)
        PacienteRequestDTO requestDTO = new PacienteRequestDTO();
        requestDTO.setNombre("Juan Modificado");
        requestDTO.setApellido("Perez");
        requestDTO.setDni("12345678");
        requestDTO.setEmail("juan@test.com");
        requestDTO.setFechaNacimiento(LocalDate.of(1990, 1, 1));
        requestDTO.setVersion(99L); // Versión desactualizada

        // Intentar actualizar y esperar un 409 Conflict
        mockMvc.perform(put("/api/pacientes/" + testPaciente.getId())
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("El registro fue modificado por otro usuario. Por favor recarga la página e intenta nuevamente."));
    }

    @Test
    void testOptimisticLockingOnConsultaUpdate() throws Exception {
        AuthRequestDTO loginRequest = new AuthRequestDTO();
        loginRequest.setUsername("doctor.test");
        loginRequest.setPassword("Password123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie jwtCookie = result.getResponse().getCookie("jwt_token");

        com.consultorio.dto.ConsultaRequestDTO crearDto = new com.consultorio.dto.ConsultaRequestDTO();
        crearDto.setPacienteId(testPaciente.getId());
        crearDto.setMotivo("Control de rutina");

        MvcResult creado = mockMvc.perform(post("/api/consultas")
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crearDto)))
                .andExpect(status().isCreated())
                .andReturn();

        Long consultaId = objectMapper.readTree(creado.getResponse().getContentAsString()).get("id").asLong();

        com.consultorio.dto.ConsultaRequestDTO actualizarDto = new com.consultorio.dto.ConsultaRequestDTO();
        actualizarDto.setPacienteId(testPaciente.getId());
        actualizarDto.setMotivo("Motivo actualizado");
        actualizarDto.setVersion(99L); // Versión desactualizada

        mockMvc.perform(put("/api/consultas/" + consultaId)
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(actualizarDto)))
                .andExpect(status().isConflict());
    }

    @Test
    void testOptimisticLockingOnHistoriaPsiquiatricaUpdate() throws Exception {
        AuthRequestDTO loginRequest = new AuthRequestDTO();
        loginRequest.setUsername("doctor.test");
        loginRequest.setPassword("Password123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie jwtCookie = result.getResponse().getCookie("jwt_token");

        com.consultorio.dto.HistoriaPsiquiatricaDTO crearDto = com.consultorio.dto.HistoriaPsiquiatricaDTO.builder()
                .antecedentesFamiliares("Sin antecedentes")
                .build();

        // Primera llamada crea la historia (esNueva=true, no exige versión)
        mockMvc.perform(put("/api/pacientes/" + testPaciente.getId() + "/historia-psiquiatrica")
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crearDto)))
                .andExpect(status().isOk());

        com.consultorio.dto.HistoriaPsiquiatricaDTO actualizarDto = com.consultorio.dto.HistoriaPsiquiatricaDTO.builder()
                .antecedentesFamiliares("Actualización con versión vieja")
                .version(99L)
                .build();

        mockMvc.perform(put("/api/pacientes/" + testPaciente.getId() + "/historia-psiquiatrica")
                        .cookie(jwtCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(actualizarDto)))
                .andExpect(status().isConflict());
    }
}
