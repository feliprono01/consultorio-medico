package com.consultorio.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import net.lingala.zip4j.ZipFile;
import net.lingala.zip4j.model.ZipParameters;
import net.lingala.zip4j.model.enums.AesKeyStrength;
import net.lingala.zip4j.model.enums.EncryptionMethod;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
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

    @Value("${backup.zip.password:SecurePassword123!}")
    private String zipPassword;

    @Value("${backup.retention.days:30}")
    private int retentionDays;

    @Autowired
    private EmailService emailService;

    @Scheduled(cron = "${backup.cron:0 0 2 * * ?}")
    public void performScheduledBackup() {
        try {
            logger.info("Iniciando backup automático...");
            String fileName = performBackup("auto");

            // Limpieza de backups antiguos
            cleanupOldBackups();

            // Enviar por correo
            try {
                Path backupPath = Paths.get(outputDir).resolve(fileName);
                String subject = "Backup Automático (Encriptado) - Consultorio Médico - "
                        + LocalDateTime.now().format(DateTimeFormatter.ISO_DATE);
                String body = "Adjunto encontrará el backup automático de la base de datos generado el "
                        + LocalDateTime.now() + ".\n\nEl archivo está comprimido y encriptado por seguridad.";

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
        Path backupPath = Paths.get(outputDir);
        if (!Files.exists(backupPath)) {
            Files.createDirectories(backupPath);
        }

        String dbName = extractDbName(dbUrl);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        String sqlFileName = String.format("backup_%s_%s_%s.sql", dbName, suffix, timestamp);
        String zipFileName = String.format("backup_%s_%s_%s.zip", dbName, suffix, timestamp);
        
        File sqlFile = backupPath.resolve(sqlFileName).toFile();
        File zipFile = backupPath.resolve(zipFileName).toFile();

        // 1. Generar SQL con mysqldump
        // --single-transaction: exporta sin bloquear tablas (necesario para usuarios sin LOCK TABLES)
        // -h 127.0.0.1: fuerza conexión TCP en lugar de socket Unix (requerido en Windows)
        logger.info("Iniciando mysqldump: user={}, db={}, output={}", dbUser, dbName, sqlFile.getAbsolutePath());
        // La contraseña se pasa por la variable de entorno MYSQL_PWD del proceso hijo,
        // nunca como argumento — un argumento de línea de comandos queda visible para
        // cualquier otro proceso local (ps/Task Manager) mientras el proceso corre.
        ProcessBuilder pb = new ProcessBuilder(
                mysqldumpPath,
                "-u" + dbUser,
                "-h", "127.0.0.1", "-P", "3306",
                "--single-transaction", "--skip-lock-tables",
                "--databases", dbName,
                "-r", sqlFile.getAbsolutePath());

        if (dbPassword != null && !dbPassword.isEmpty()) {
            pb.environment().put("MYSQL_PWD", dbPassword);
        }

        pb.redirectErrorStream(true);
        Process process = pb.start();

        int exitCode = process.waitFor();
        if (exitCode == 0) {
            logger.info("SQL dump creado exitosamente: {}", sqlFileName);
            
            // 2. Comprimir y encriptar el archivo SQL
            ZipParameters zipParameters = new ZipParameters();
            zipParameters.setEncryptFiles(true);
            zipParameters.setEncryptionMethod(EncryptionMethod.AES);
            zipParameters.setAesKeyStrength(AesKeyStrength.KEY_STRENGTH_256);

            try (ZipFile zip = new ZipFile(zipFile, zipPassword.toCharArray())) {
                zip.addFile(sqlFile, zipParameters);
                logger.info("Backup encriptado exitosamente: {}", zipFileName);
            }
            
            // 3. Eliminar el archivo SQL en texto plano por seguridad
            Files.deleteIfExists(sqlFile.toPath());
            
            return zipFileName;
        } else {
            String errorOutput = new String(process.getInputStream().readAllBytes());
            logger.error("mysqldump falló. Exit code: {}. Detalle: {}", exitCode, errorOutput);
            // Limpiar el archivo SQL vacío/incompleto si quedó
            Files.deleteIfExists(sqlFile.toPath());
            throw new IOException("mysqldump falló (exit " + exitCode + "): " + errorOutput);
        }
    }
    
    private void cleanupOldBackups() {
        try {
            Path backupPath = Paths.get(outputDir);
            if (!Files.exists(backupPath)) return;
            
            Instant cutoffDate = Instant.now().minus(retentionDays, ChronoUnit.DAYS);
            
            try (Stream<Path> stream = Files.list(backupPath)) {
                stream.filter(file -> !Files.isDirectory(file))
                      .filter(file -> file.toString().endsWith(".zip") || file.toString().endsWith(".sql"))
                      .forEach(file -> {
                          try {
                              BasicFileAttributes attr = Files.readAttributes(file, BasicFileAttributes.class);
                              if (attr.creationTime().toInstant().isBefore(cutoffDate)) {
                                  Files.delete(file);
                                  logger.info("Backup antiguo eliminado por política de retención ({} días): {}", retentionDays, file.getFileName());
                              }
                          } catch (IOException e) {
                              logger.error("Error al eliminar backup antiguo: {}", file.getFileName(), e);
                          }
                      });
            }
        } catch (Exception e) {
            logger.error("Error en proceso de limpieza de backups", e);
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
                    .filter(name -> name.endsWith(".zip") || name.endsWith(".sql"))
                    .sorted((f1, f2) -> f2.compareTo(f1)) // Más reciente primero
                    .collect(Collectors.toList());
        }
    }

    public Resource loadBackupAsResource(String filename) throws MalformedURLException {
        Path backupDir = Paths.get(outputDir).toAbsolutePath().normalize();
        Path file = backupDir.resolve(filename).normalize();

        if (!file.startsWith(backupDir)) {
            throw new SecurityException("Acceso denegado: el archivo está fuera del directorio de backups.");
        }

        Resource resource = new UrlResource(file.toUri());
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Could not read file: " + filename);
        }
    }

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
