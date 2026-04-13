package com.consultorio.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class BackupService {

    private static final Logger logger = LoggerFactory.getLogger(BackupService.class);

    @Value("${backup.mysqldump-path}")
    private String mysqldumpPath;

    @Value("${backup.output-dir}")
    private String outputDir;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${backup.email.to}")
    private String backupEmailTo;

    @Autowired
    private EmailService emailService;

    // Ejecutar backup automático todos los días a las 02:00 AM
    @Scheduled(cron = "0 0 2 * * ?")
    public void performScheduledBackup() {
        try {
            logger.info("Iniciando backup automático...");
            String fileName = performBackup("auto");

            // Enviar por correo
            try {
                Path backupPath = Paths.get(outputDir).resolve(fileName);
                String subject = "Backup Automático - Consultorio Médico - "
                        + LocalDateTime.now().format(DateTimeFormatter.ISO_DATE);
                String body = "Adjunto encontrará el backup automático de la base de datos generado el "
                        + LocalDateTime.now();

                emailService.sendEmailWithAttachment(backupEmailTo, subject, body, backupPath.toString());
                logger.info("Backup enviado por correo exitosamente a {}", backupEmailTo);
            } catch (Exception e) {
                logger.error("Error al enviar backup por correo", e);
            }

        } catch (IOException | InterruptedException e) {
            logger.error("Error en backup automático", e);
        }
    }

    public String performBackup(String suffix) throws IOException, InterruptedException {
        // Crear directorio si no existe
        Path backupPath = Paths.get(outputDir);
        if (!Files.exists(backupPath)) {
            Files.createDirectories(backupPath);
        }

        String dbName = extractDbName(dbUrl);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        String fileName = String.format("backup_%s_%s_%s.sql", dbName, suffix, timestamp);
        File outputFile = backupPath.resolve(fileName).toFile();

        // Construir comando (se debe manejar la pass vacía con cuidado, pero
        // ProcessBuilder es seguro)
        ProcessBuilder pb;
        if (dbPassword == null || dbPassword.isEmpty()) {
            pb = new ProcessBuilder(
                    mysqldumpPath,
                    "-u" + dbUser,
                    "--databases", dbName,
                    "-r", outputFile.getAbsolutePath());
        } else {
            pb = new ProcessBuilder(
                    mysqldumpPath,
                    "-u" + dbUser,
                    "-p" + dbPassword,
                    "--databases", dbName,
                    "-r", outputFile.getAbsolutePath());
        }

        pb.redirectErrorStream(true);
        Process process = pb.start();

        int exitCode = process.waitFor();
        if (exitCode == 0) {
            logger.info("Backup creado exitosamente: {}", fileName);
            return fileName;
        } else {
            // Leer error del proceso si falla
            String errorOutput = new String(process.getInputStream().readAllBytes());
            logger.error("Error creating backup. Exit code: {}. Output: {}", exitCode, errorOutput);
            throw new IOException("Backup failed with exit code " + exitCode + ": " + errorOutput);
        }
    }

    public List<String> listBackups() throws IOException {
        Path backupPath = Paths.get(outputDir);
        if (!Files.exists(backupPath)) {
            return List.of();
        }
        try (Stream<Path> stream = Files.list(backupPath)) {
            return stream
                    .filter(file -> !Files.isDirectory(file))
                    .map(Path::getFileName)
                    .map(Path::toString)
                    .filter(name -> name.endsWith(".sql"))
                    .sorted((f1, f2) -> f2.compareTo(f1)) // Más reciente primero
                    .collect(Collectors.toList());
        }
    }

    public Resource loadBackupAsResource(String filename) throws MalformedURLException {
        Path file = Paths.get(outputDir).resolve(filename);
        Resource resource = new UrlResource(file.toUri());
        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Could not read file: " + filename);
        }
    }

    // Extraer nombre de la BD de la URL JDBC (ej:
    // jdbc:mysql://localhost:3306/mi_db?...)
    private String extractDbName(String url) {
        String cleanUrl = url.substring(13); // remove jdbc:mysql://
        if (cleanUrl.contains("?")) {
            cleanUrl = cleanUrl.substring(0, cleanUrl.indexOf("?"));
        }
        if (cleanUrl.contains("/")) {
            return cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
        }
        return cleanUrl;
    }
}
