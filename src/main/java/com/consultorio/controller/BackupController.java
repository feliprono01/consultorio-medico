package com.consultorio.controller;

import com.consultorio.service.BackupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backups")
@PreAuthorize("hasAuthority('ADMIN')") // Solo admins pueden hacer backups
public class BackupController {

    @Autowired
    private BackupService backupService;

    @PostMapping
    public ResponseEntity<Map<String, String>> createBackup() {
        try {
            String fileName = backupService.performBackup("manual");
            return ResponseEntity.ok(Map.of("message", "Backup creado exitosamente", "fileName", fileName));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error creando backup: " + e.getMessage()));
        }
    }


    /**
     * Dispara el backup completo (genera .sql + envía email) de forma inmediata.
     * Equivale a lo que ejecutaría el cron automático.
     * Solo para testing y verificación manual.
     */
    @PostMapping("/test-email")
    public ResponseEntity<Map<String, String>> testBackupWithEmail() {
        try {
            backupService.performScheduledBackup();
            return ResponseEntity.ok(Map.of("message", "Backup con email disparado. Revisá los logs del servidor y tu bandeja de entrada."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<String>> listBackups() {
        try {
            List<String> files = backupService.listBackups();
            return ResponseEntity.ok(files);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> downloadBackup(@PathVariable String filename) {
        // Rechazar filenames con caracteres sospechosos
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\") || (!filename.endsWith(".sql") && !filename.endsWith(".zip"))) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Resource file = backupService.loadBackupAsResource(filename);
            
            MediaType mediaType = filename.endsWith(".zip") 
                ? MediaType.parseMediaType("application/zip")
                : MediaType.parseMediaType("application/sql");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                    .contentType(mediaType)
                    .body(file);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
