package com.consultorio.security;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Convertidor JPA para encriptación de campos sensibles en reposo (AES-256-GCM).
 * Aplica automáticamente al persistir y leer desde la base de datos con la anotación @Convert.
 * 
 * Cumple con Ley 25.326 de Protección de Datos Personales (Argentina) garantizando
 * que la información médica no sea legible en texto plano si se compromete la base de datos.
 */
@Slf4j
@Component
@Converter
public class AttributeEncryptor implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH_BYTES = 12; // 96 bits para GCM
    private static final int TAG_LENGTH_BITS = 128;
    private static final String ENC_PREFIX = "ENC:";

    private static SecretKey secretKeySpec;

    @Value("${app.security.encryption-key:ConsultorioMedicoSecretKey2026!AES256GCM}")
    private String encryptionKeyProperty;

    public AttributeEncryptor() {
        // Inicialización por defecto en caso de ser instanciado directamente por Hibernate
        if (secretKeySpec == null) {
            initKey("ConsultorioMedicoSecretKey2026!AES256GCM");
        }
    }

    @PostConstruct
    public void init() {
        if (encryptionKeyProperty != null && !encryptionKeyProperty.isEmpty()) {
            initKey(encryptionKeyProperty);
            log.info("AttributeEncryptor inicializado correctamente con AES-256-GCM");
        }
    }

    private static synchronized void initKey(String secret) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
            secretKeySpec = new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            log.error("Error al inicializar la clave de encriptación AES-256-GCM", e);
            throw new IllegalStateException("Fallo en la inicialización de AttributeEncryptor", e);
        }
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return attribute;
        }
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, parameterSpec);

            byte[] cipherText = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));

            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            String base64Encoded = Base64.getEncoder().encodeToString(byteBuffer.array());
            return ENC_PREFIX + base64Encoded;
        } catch (Exception e) {
            log.error("Error al encriptar campo para la base de datos", e);
            throw new IllegalStateException("Error de encriptación de datos sensibles", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return dbData;
        }
        // Retrocompatibilidad: Si el dato en DB no empieza con el prefijo "ENC:", se asume texto plano antiguo
        if (!dbData.startsWith(ENC_PREFIX)) {
            return dbData;
        }
        try {
            String base64Data = dbData.substring(ENC_PREFIX.length());
            byte[] decoded = Base64.getDecoder().decode(base64Data);

            if (decoded.length <= IV_LENGTH_BYTES) {
                log.warn("Dato encriptado corrupto o inválido en longitud, retornando como está");
                return dbData;
            }

            ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[IV_LENGTH_BYTES];
            byteBuffer.get(iv);

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec, parameterSpec);

            byte[] plainTextBytes = cipher.doFinal(cipherText);
            return new String(plainTextBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Error al desencriptar campo desde la base de datos (posible clave modificada o dato corrupto). Retornando dato crudo.", e);
            return dbData;
        }
    }
}
