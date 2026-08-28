package com.consultorio.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Cálculo del encadenado de integridad (tamper-evidence) usado por los
 * registros de auditoría de cambios (ConsultaAuditLog,
 * HistoriaPsiquiatricaAuditLog).
 *
 * Cada fila nueva de una tabla de auditoría guarda el hash SHA-256 de sus
 * propios datos concatenados con el hash de la fila anterior de esa misma
 * tabla — es una sola cadena por tabla, no una por consulta/paciente. Si
 * alguien edita o borra un registro en el medio (aunque tenga acceso
 * directo a la base de datos, por fuera de la aplicación), el hash
 * recalculado de ese registro y de todos los siguientes deja de coincidir
 * con el guardado, así que la alteración queda demostrada recalculando la
 * cadena — mismo principio que usan los commits de git o un blockchain.
 *
 * Es la pieza técnica que sostiene, ante una revisión legal/pericial, que
 * el historial de cambios no fue alterado después de escrito.
 */
public final class HashChainUtil {

    /** Valor fijo usado como "hash anterior" del primer registro de cada tabla. */
    public static final String GENESIS = "GENESIS";

    private HashChainUtil() {
    }

    /**
     * Calcula el siguiente hash de la cadena a partir del hash anterior (o
     * {@link #GENESIS} si es el primer registro) y los campos del nuevo
     * registro, en el mismo orden siempre.
     */
    public static String siguienteHash(String hashAnterior, String... campos) {
        StringBuilder contenido = new StringBuilder(hashAnterior == null ? GENESIS : hashAnterior);
        for (String campo : campos) {
            contenido.append('|').append(campo == null ? "" : campo);
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(contenido.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hashBytes.length * 2);
            for (byte b : hashBytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 es un algoritmo estándar de la JVM — no debería faltar nunca.
            throw new IllegalStateException("SHA-256 no disponible en esta JVM", e);
        }
    }
}
