package com.consultorio.controller;

import com.consultorio.model.Role;
import com.consultorio.model.Usuario;
import com.consultorio.repository.UsuarioRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsers() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Usuario> createUser(@RequestBody CreateUserRequest request) {
        if (usuarioRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().build(); // Username taken
        }

        Usuario user = Usuario.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .dni(request.getDni())
                .matricula(request.getMatricula())
                .build();

        return ResponseEntity.ok(usuarioRepository.save(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> resetPassword(@PathVariable Long id, @RequestBody UpdatePasswordRequest request) {
        return usuarioRepository.findById(id).map(user -> {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            usuarioRepository.save(user);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class CreateUserRequest {
        private String username;
        private String password;
        private Role role;
        private String nombre;
        private String apellido;
        private String dni;
        private String matricula;
    }

    @Data
    public static class UpdatePasswordRequest {
        private String password;
    }
}
