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
@PreAuthorize("hasRole('ADMIN')") // Solo admins pueden hacer backups
public class BackupController {

    @Autowired
    private BackupService backupService;

    @PostMapping
    public ResponseEntity<Map<String, String>> createBackup() {
        try {
            String fileName = backupService.performBackup("manual");
            return ResponseEntity.ok(Map.of("message", "Backup creado exitosamente", "fileName", fileName));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error creando backup: " + e.getMessage()));
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
        try {
            Resource file = backupService.loadBackupAsResource(filename);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                    .contentType(MediaType.parseMediaType("application/sql"))
                    .body(file);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
