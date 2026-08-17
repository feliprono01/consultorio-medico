package com.consultorio.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Test de regresión: loadBackupAsResource ya mitiga path traversal
 * (BackupService.java:199-213) — este test lo bloquea ante un cambio futuro
 * que rompa esa validación sin querer.
 */
class BackupServiceTest {

    private BackupService backupService;

    @TempDir
    Path backupDir;

    @BeforeEach
    void setUp() throws IOException {
        backupService = new BackupService();
        ReflectionTestUtils.setField(backupService, "outputDir", backupDir.toString());

        // Archivo legítimo dentro del directorio de backups
        Files.writeString(backupDir.resolve("backup_valido.sql"), "contenido de prueba");

        // Archivo "secreto" fuera del directorio de backups, simulando el objetivo de un ataque
        Files.writeString(backupDir.getParent().resolve("secreto.sql"), "no deberia ser accesible");
    }

    @Test
    void archivoLegitimoDentroDelDirectorioSeLeeBien() throws MalformedURLException {
        var resource = backupService.loadBackupAsResource("backup_valido.sql");
        assertEquals(true, resource.exists());
    }

    @Test
    void pathTraversalConDobleSlashEsRechazado() {
        assertThrows(SecurityException.class,
                () -> backupService.loadBackupAsResource("../secreto.sql"));
    }

    @Test
    void pathTraversalConMultiplesNivelesEsRechazado() {
        assertThrows(SecurityException.class,
                () -> backupService.loadBackupAsResource("../../../../etc/passwd"));
    }
}
