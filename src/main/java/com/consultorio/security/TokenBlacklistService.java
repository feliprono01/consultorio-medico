package com.consultorio.security;

import com.consultorio.model.RevokedToken;
import com.consultorio.repository.RevokedTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

/**
 * Servicio de blacklist de tokens JWT.
 *
 * Flujo:
 *  1. En logout → revokeToken(jwt, expiration) guarda el hash SHA-256 del token en DB.
 *  2. En cada request → JwtAuthenticationFilter llama a isRevoked(jwt) antes de autenticar.
 *  3. Job diario a las 3AM → cleanupExpiredTokens() borra filas vencidas para no inflar la tabla.
 *
 * Por qué hash SHA-256 y no el token completo:
 *  - Un acceso a la DB no permite reconstruir el JWT original.
 *  - El hash tiene tamaño fijo (64 chars hex), eficiente para indexar.
 */
@Service
public class TokenBlacklistService {

    private static final Logger log = LoggerFactory.getLogger(TokenBlacklistService.class);

    private final RevokedTokenRepository repository;

    public TokenBlacklistService(RevokedTokenRepository repository) {
        this.repository = repository;
    }

    /**
     * Revoca un JWT: guarda su hash en la tabla revoked_tokens.
     * Llamar en logout.
     *
     * @param jwt        el token JWT completo
     * @param expiration la fecha de expiración del token (extraída del payload)
     */
    public void revokeToken(String jwt, Date expiration) {
        String hash = hashToken(jwt);

        // Evitar duplicados si el token ya fue revocado
        if (repository.existsByTokenHash(hash)) {
            return;
        }

        LocalDateTime expiresAt = expiration.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        repository.save(new RevokedToken(hash, expiresAt));
        log.info("JWT revocado — hash: {}...", hash.substring(0, 8));
    }

    /**
     * Verifica si un JWT está revocado (fue invalidado por logout).
     * Llamar en el filtro de autenticación antes de procesar el request.
     *
     * @param jwt el token JWT completo
     * @return true si el token fue revocado
     */
    public boolean isRevoked(String jwt) {
        return repository.existsByTokenHash(hashToken(jwt));
    }

    /**
     * Job de limpieza automática: elimina tokens revocados cuya expiración ya pasó.
     * Se ejecuta todos los días a las 3:00 AM (fuera del horario de uso del consultorio).
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void cleanupExpiredTokens() {
        int deleted = repository.deleteExpiredTokens(LocalDateTime.now());
        if (deleted > 0) {
            log.info("Blacklist cleanup: {} tokens expirados eliminados", deleted);
        }
    }

    /**
     * Genera un hash SHA-256 del JWT en formato hexadecimal (64 chars).
     */
    private String hashToken(String jwt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(jwt.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(64);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 siempre está disponible en JVMs estándar
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }
}
