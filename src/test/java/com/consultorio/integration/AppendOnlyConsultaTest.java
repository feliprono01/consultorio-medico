package com.consultorio.integration;

import com.consultorio.dto.AuthRequestDTO;
import com.consultorio.dto.ConsultaRequestDTO;
import com.consultorio.model.Consulta;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Verifica el modelo append-only de Consulta (Ley 26.657 / guía de HCE):
 * corregir una consulta NUNCA modifica la fila original, siempre crea una
 * fila nueva que la referencia — y los listados solo muestran la versión
 * vigente de cada visita.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AppendOnlyConsultaTest {

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
    private EntityManager entityManager;

    private Paciente testPaciente;
    private Cookie doctorCookie;

    @BeforeEach
    void setUp() throws Exception {
        usuarioRepository.save(Usuario.builder()
                .username("doctor.appendonly").password(passwordEncoder.encode("Password123!"))
                .nombre("Doctor").apellido("AppendOnly").role(Role.USER).build());

        testPaciente = pacienteRepository.save(Paciente.builder()
                .nombre("Paciente").apellido("AppendOnly").dni("77788899")
                .fechaNacimiento(LocalDate.of(1980, 1, 1)).active(true).build());

        AuthRequestDTO login = new AuthRequestDTO();
        login.setUsername("doctor.appendonly");
        login.setPassword("Password123!");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();
        doctorCookie = result.getResponse().getCookie("jwt_token");
    }

    @Test
    void corregirNuncaModificaLaFilaOriginalYArmaUnaCadenaRecorrible() throws Exception {
        ConsultaRequestDTO crear = new ConsultaRequestDTO();
        crear.setPacienteId(testPaciente.getId());
        crear.setMotivo("Motivo original");
        crear.setDiagnosticoCie10("F32.1");

        MvcResult creado = mockMvc.perform(post("/api/consultas")
                        .cookie(doctorCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crear)))
                .andExpect(status().isCreated())
                // El código CIE-10 tiene que llegar de punta a punta -- si el mapper
                // pierde el campo (por ejemplo, un builder que no lo expone), esta
                // aserción lo detecta en vez de guardar "F32.1" en la base y devolver
                // null en la respuesta sin que nadie se entere.
                .andExpect(jsonPath("$.diagnosticoCie10").value("F32.1"))
                .andReturn();
        Long originalId = objectMapper.readTree(creado.getResponse().getContentAsString()).get("id").asLong();

        // Primera corrección.
        ConsultaRequestDTO correccion1 = new ConsultaRequestDTO();
        correccion1.setPacienteId(testPaciente.getId());
        correccion1.setMotivo("Motivo corregido 1");
        MvcResult resultado1 = mockMvc.perform(post("/api/consultas/" + originalId + "/corregir")
                        .cookie(doctorCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(correccion1)))
                .andExpect(status().isOk())
                .andReturn();
        entityManager.flush();
        entityManager.clear();
        Long correccion1Id = objectMapper.readTree(resultado1.getResponse().getContentAsString()).get("id").asLong();

        // La fila original NUNCA cambió — sigue con su motivo de siempre.
        Consulta original = consultaRepository.findById(originalId).orElseThrow();
        assertEquals("Motivo original", original.getMotivo());
        assertNull(original.getCorreccionDeId());
        assertEquals(originalId, original.getId());

        // La corrección apunta a la original, tiene motivo nuevo, y es una fila distinta.
        Consulta correccion1Entity = consultaRepository.findById(correccion1Id).orElseThrow();
        assertEquals("Motivo corregido 1", correccion1Entity.getMotivo());
        assertEquals(originalId, correccion1Entity.getCorreccionDeId());

        // Segunda corrección, sobre la primera corrección (que ahora es la vigente).
        ConsultaRequestDTO correccion2 = new ConsultaRequestDTO();
        correccion2.setPacienteId(testPaciente.getId());
        correccion2.setMotivo("Motivo corregido 2");
        MvcResult resultado2 = mockMvc.perform(post("/api/consultas/" + correccion1Id + "/corregir")
                        .cookie(doctorCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(correccion2)))
                .andExpect(status().isOk())
                .andReturn();
        entityManager.flush();
        entityManager.clear();
        Long correccion2Id = objectMapper.readTree(resultado2.getResponse().getContentAsString()).get("id").asLong();

        // Ninguna de las dos versiones anteriores cambió.
        assertEquals("Motivo original", consultaRepository.findById(originalId).orElseThrow().getMotivo());
        assertEquals("Motivo corregido 1", consultaRepository.findById(correccion1Id).orElseThrow().getMotivo());

        // Intentar corregir la PRIMERA corrección de nuevo (ya no es vigente) rechaza con 409.
        ConsultaRequestDTO correccionAciegas = new ConsultaRequestDTO();
        correccionAciegas.setPacienteId(testPaciente.getId());
        correccionAciegas.setMotivo("No debería poder guardarse");
        mockMvc.perform(post("/api/consultas/" + correccion1Id + "/corregir")
                        .cookie(doctorCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(correccionAciegas)))
                .andExpect(status().isConflict());

        // La cadena completa (GET /versiones) trae las 3 versiones, en orden, y
        // solo la última figura como vigente (corregida:false).
        mockMvc.perform(get("/api/consultas/" + correccion2Id + "/versiones").cookie(doctorCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].id").value(originalId))
                .andExpect(jsonPath("$[0].motivo").value("Motivo original"))
                .andExpect(jsonPath("$[0].corregida").value(true))
                .andExpect(jsonPath("$[1].id").value(correccion1Id))
                .andExpect(jsonPath("$[1].correccionDeId").value(originalId))
                .andExpect(jsonPath("$[1].corregida").value(true))
                .andExpect(jsonPath("$[2].id").value(correccion2Id))
                .andExpect(jsonPath("$[2].correccionDeId").value(correccion1Id))
                .andExpect(jsonPath("$[2].motivo").value("Motivo corregido 2"))
                .andExpect(jsonPath("$[2].corregida").value(false));

        // El listado del paciente solo muestra la vigente (una sola fila para esta visita).
        mockMvc.perform(get("/api/consultas/paciente/" + testPaciente.getId()).cookie(doctorCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(correccion2Id));
    }
}
