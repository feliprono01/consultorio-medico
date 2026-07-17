package com.consultorio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Tabla de tokens JWT revocados (blacklist).
 * 
 * Cuando el usuario hace logout, el JWT activo se guarda aquí como hash SHA-256.
 * El JwtAuthenticationFilter consulta esta tabla antes de autenticar cada request.
 * 
 * No almacenamos el token completo: usamos su hash SHA-256 (64 chars hex) para que
 * un acceso indebido a la DB no permita reconstruir los JWTs.
 * 
 * Limpieza automática: un job programado elimina las filas cuyo expiresAt ya pasó,
 * para que la tabla no crezca indefinidamente.
 */
@Entity
@Table(
    name = "revoked_tokens",
    indexes = {
        @Index(name = "idx_revoked_token_hash",  columnList = "token_hash"),
        @Index(name = "idx_revoked_expires_at",  columnList = "expires_at")
    }
)
public class RevokedToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Hash SHA-256 del JWT (hex, 64 chars). */
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    /** Cuándo expira el JWT original — usado para limpiar filas obsoletas. */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /** Cuándo se revocó (auditoría). */
    @Column(name = "revoked_at", nullable = false)
    private LocalDateTime revokedAt;

    public RevokedToken() {}

    public RevokedToken(String tokenHash, LocalDateTime expiresAt) {
        this.tokenHash = tokenHash;
        this.expiresAt  = expiresAt;
        this.revokedAt  = LocalDateTime.now();
    }

    public Long getId()                      { return id; }
    public String getTokenHash()             { return tokenHash; }
    public LocalDateTime getExpiresAt()      { return expiresAt; }
    public LocalDateTime getRevokedAt()      { return revokedAt; }

    public void setId(Long id)               { this.id = id; }
    public void setTokenHash(String h)       { this.tokenHash = h; }
    public void setExpiresAt(LocalDateTime d){ this.expiresAt = d; }
    public void setRevokedAt(LocalDateTime d){ this.revokedAt = d; }
}
