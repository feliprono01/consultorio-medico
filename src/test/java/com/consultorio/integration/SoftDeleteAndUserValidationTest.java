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
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SoftDeleteAndUserValidationTest {

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

    private Cookie doctorCookie;
    private Cookie adminCookie;
    private Paciente pacienteInactivo;

    @BeforeEach
    void setUp() throws Exception {
        usuarioRepository.save(Usuario.builder()
                .username("doctor.softdelete")
                .password(passwordEncoder.encode("Password123!"))
                .nombre("Doctor").apellido("Test").role(Role.USER).build());

        usuarioRepository.save(Usuario.builder()
                .username("admin.softdelete")
                .password(passwordEncoder.encode("Password123!"))
                .nombre("Admin").apellido("Test").role(Role.ADMIN).build());

        doctorCookie = login("doctor.softdelete");
        adminCookie = login("admin.softdelete");

        pacienteInactivo = Paciente.builder()
                .nombre("Paciente").apellido("Inactivo")
                .dni("87654321")
                .fechaNacimiento(LocalDate.of(1985, 5, 5))
                .active(false)
                .build();
        pacienteRepository.save(pacienteInactivo);
    }

    private Cookie login(String username) throws Exception {
        AuthRequestDTO loginRequest = new AuthRequestDTO();
        loginRequest.setUsername(username);
        loginRequest.setPassword("Password123!");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        return result.getResponse().getCookie("jwt_token");
    }

    @Test
    void noSePuedeCrearConsultaSobrePacienteInactivo() throws Exception {
        ConsultaRequestDTO dto = new ConsultaRequestDTO();
        dto.setPacienteId(pacienteInactivo.getId());
        dto.setMotivo("Control de rutina");

        mockMvc.perform(post("/api/consultas")
                        .cookie(doctorCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void noSePuedeLeerNiEditarUnaConsultaDadaDeBaja() throws Exception {
        Paciente pacienteActivo = pacienteRepository.save(Paciente.builder()
                .nombre("Paciente").apellido("Activo")
                .dni("11223344")
                .fechaNacimiento(LocalDate.of(1990, 1, 1))
                .active(true)
                .build());

        var consulta = new com.consultorio.model.Consulta();
        consulta.setPaciente(pacienteActivo);
        consulta.setMotivo("Consulta a eliminar");
        consulta.setFechaConsulta(java.time.LocalDateTime.now());
        consulta.softDelete();
        consulta = consultaRepository.save(consulta);

        mockMvc.perform(get("/api/consultas/" + consulta.getId())
                        .cookie(doctorCookie))
                .andExpect(status().isNotFound());

        ConsultaRequestDTO dto = new ConsultaRequestDTO();
        dto.setPacienteId(pacienteActivo.getId());
        dto.setMotivo("Intento de edición");

        mockMvc.perform(put("/api/consultas/" + consulta.getId())
                        .cookie(doctorCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void noSePuedeLeerNiEditarUnPacienteDadoDeBaja() throws Exception {
        Paciente pacienteBaja = pacienteRepository.save(Paciente.builder()
                .nombre("Paciente").apellido("Eliminado")
                .dni("55566677")
                .fechaNacimiento(LocalDate.of(1975, 3, 3))
                .active(false)
                .build());

        mockMvc.perform(get("/api/pacientes/" + pacienteBaja.getId())
                        .cookie(doctorCookie))
                .andExpect(status().isNotFound());

        com.consultorio.dto.PacienteRequestDTO dto = new com.consultorio.dto.PacienteRequestDTO();
        dto.setNombre("Intento de edición");
        dto.setApellido("Eliminado");
        dto.setDni("55566677");
        dto.setFechaNacimiento(LocalDate.of(1975, 3, 3));

        mockMvc.perform(put("/api/pacientes/" + pacienteBaja.getId())
                        .cookie(doctorCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void noSePuedeCrearUsuarioConPasswordCorta() throws Exception {
        String body = """
                {"username":"nuevo.usuario","password":"1234"}
                """;

        mockMvc.perform(post("/api/users")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }
}
