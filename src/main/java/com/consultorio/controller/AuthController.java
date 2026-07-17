package com.consultorio.controller;

import com.consultorio.dto.AuthRequestDTO;
import com.consultorio.dto.AuthResponseDTO;
import com.consultorio.repository.UsuarioRepository;
import com.consultorio.security.JwtService;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        private final UsuarioRepository usuarioRepository;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        @Value("${jwt.expiration:86400000}")
        private long jwtExpiration;

        /**
         * En dev (HTTP) la cookie NO lleva Secure para que funcione en localhost.
         * En producción configurar: jwt.cookie.secure=true
         */
        @Value("${jwt.cookie.secure:false}")
        private boolean cookieSecure;

        public AuthController(UsuarioRepository usuarioRepository,
                        JwtService jwtService,
                        AuthenticationManager authenticationManager) {
                this.usuarioRepository = usuarioRepository;
                this.jwtService = jwtService;
                this.authenticationManager = authenticationManager;
        }

        @PostMapping("/login")
        public ResponseEntity<AuthResponseDTO> login(
                        @RequestBody AuthRequestDTO request,
                        HttpServletResponse response) {

                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

                var user = usuarioRepository.findByUsername(request.getUsername()).orElseThrow();
                var jwtToken = jwtService.generateToken(user);

                // Setear el JWT como HttpOnly cookie — inaccesible desde JavaScript (anti-XSS)
                ResponseCookie cookie = ResponseCookie.from("jwt_token", jwtToken)
                        .httpOnly(true)                                  // ← no accesible via JS
                        .secure(cookieSecure)                            // ← true en prod (HTTPS)
                        .path("/")                                       // ← válida para toda la app
                        .maxAge(Duration.ofMillis(jwtExpiration))       // ← mismo tiempo que el JWT
                        .sameSite("Strict")                             // ← protección CSRF
                        .build();

                response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                // Devolver solo el rol en el body — el token ya viaja en la cookie
                return ResponseEntity.ok(AuthResponseDTO.builder()
                                .role(user.getRole().name())
                                .build());
        }

        @PostMapping("/logout")
        public ResponseEntity<Void> logout(HttpServletResponse response) {
                // Limpiar la cookie seteando maxAge=0
                ResponseCookie cookie = ResponseCookie.from("jwt_token", "")
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .path("/")
                        .maxAge(0)
                        .sameSite("Strict")
                        .build();

                response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
                return ResponseEntity.noContent().build();
        }
}
