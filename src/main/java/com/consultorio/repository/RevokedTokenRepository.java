package com.consultorio.repository;

import com.consultorio.model.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {

    /** Verifica si un hash ya está revocado. */
    boolean existsByTokenHash(String tokenHash);

    /**
     * Elimina todos los tokens cuya fecha de expiración ya pasó.
     * Llamado automáticamente por el job de limpieza (@Scheduled).
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RevokedToken r WHERE r.expiresAt < :now")
    int deleteExpiredTokens(LocalDateTime now);
}
