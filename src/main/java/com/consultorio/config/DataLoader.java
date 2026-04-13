package com.consultorio.config;

import com.consultorio.model.Usuario;
import com.consultorio.model.Role;
import com.consultorio.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create or update admin user
        var existingAdmin = usuarioRepository.findByUsername("admin");

        if (existingAdmin.isEmpty()) {
            // Create new admin user
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .role(Role.ADMIN)
                    .nombre("Administrador")
                    .apellido("Sistema")
                    .build();

            usuarioRepository.save(admin);
            System.out.println("✅ Admin user created: username=admin, password=admin");
        }
        // Else: Do nothing, preserve existing password
    }
}
