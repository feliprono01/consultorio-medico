package com.consultorio.controller;

import com.consultorio.dto.AuthRequestDTO;
import com.consultorio.dto.AuthResponseDTO;
import com.consultorio.model.Role;
import com.consultorio.model.Usuario;
import com.consultorio.repository.UsuarioRepository;
import com.consultorio.security.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        private final UsuarioRepository usuarioRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                        JwtService jwtService,
                        AuthenticationManager authenticationManager) {
                this.usuarioRepository = usuarioRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtService = jwtService;
                this.authenticationManager = authenticationManager;
        }

        @PostMapping("/register")
        public ResponseEntity<AuthResponseDTO> register(@RequestBody AuthRequestDTO request) {
                var user = Usuario.builder().username(request.getUsername())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.USER) // Por defecto
                                .nombre(request.getNombre())
                                .apellido(request.getApellido())
                                .dni(request.getDni())
                                .matricula(request.getMatricula())
                                .fechaNacimiento(request.getFechaNacimiento())
                                .build();
                usuarioRepository.save(user);
                var jwtToken = jwtService.generateToken(user);
                return ResponseEntity.ok(AuthResponseDTO.builder()
                                .token(jwtToken)
                                .role(user.getRole().name())
                                .build());
        }

        @PostMapping("/login")
        public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO request) {
                authenticationManager
                                .authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(),
                                                request.getPassword()));
                var user = usuarioRepository.findByUsername(request.getUsername()).orElseThrow();
                var jwtToken = jwtService.generateToken(user);
                return ResponseEntity.ok(AuthResponseDTO.builder()
                                .token(jwtToken)
                                .role(user.getRole().name())
                                .build());
        }
}
