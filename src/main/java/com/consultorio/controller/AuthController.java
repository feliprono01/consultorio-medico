package com.consultorio.controller;

import com.consultorio.dto.AuthRequestDTO;
import com.consultorio.dto.AuthResponseDTO;
import com.consultorio.repository.UsuarioRepository;
import com.consultorio.security.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        private final UsuarioRepository usuarioRepository;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthController(UsuarioRepository usuarioRepository,
                        JwtService jwtService,
                        AuthenticationManager authenticationManager) {
                this.usuarioRepository = usuarioRepository;
                this.jwtService = jwtService;
                this.authenticationManager = authenticationManager;
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
