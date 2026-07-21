package com.consultorio.config;

import com.consultorio.model.Usuario;
import com.consultorio.model.Role;
import com.consultorio.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:admin}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        var existingAdmin = usuarioRepository.findByUsername(adminUsername);

        if (existingAdmin.isEmpty()) {
            Usuario admin = Usuario.builder()
                    .username(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .nombre("Administrador")
                    .apellido("Sistema")
                    .build();

            usuarioRepository.save(admin);
            log.info("✅ Admin creado con username='{}'", adminUsername);
            log.warn("⚠️  Cambiá la contraseña del admin si estás en producción (var ADMIN_PASSWORD)");
        }
    }
}
