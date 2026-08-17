package com.consultorio.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AttributeEncryptorTest {

    private final AttributeEncryptor encryptor = new AttributeEncryptor();

    @Test
    void cifraYDescifraElMismoValor() {
        String original = "Diagnóstico: episodio depresivo moderado";

        String cifrado = encryptor.convertToDatabaseColumn(original);
        String descifrado = encryptor.convertToEntityAttribute(cifrado);

        assertEquals(original, descifrado);
    }

    @Test
    void elValorCifradoNuncaContieneElTextoOriginal() {
        String original = "Riesgo suicida: alto";

        String cifrado = encryptor.convertToDatabaseColumn(original);

        assertEquals(true, cifrado.startsWith("ENC:"));
        assertEquals(false, cifrado.contains(original));
    }

    @Test
    void datosLegadosSinPrefijoSeLeenComoTextoPlano() {
        String textoPlanoLegado = "Notas antiguas sin cifrar";

        String resultado = encryptor.convertToEntityAttribute(textoPlanoLegado);

        assertEquals(textoPlanoLegado, resultado);
    }

    @Test
    void nullYVacioPasanSinCambios() {
        assertNull(encryptor.convertToDatabaseColumn(null));
        assertNull(encryptor.convertToEntityAttribute(null));
        assertEquals("", encryptor.convertToDatabaseColumn(""));
        assertEquals("", encryptor.convertToEntityAttribute(""));
    }

    @Test
    void datoCorruptoFallaExplicitamenteEnVezDeDevolverBasura() {
        String cifrado = encryptor.convertToDatabaseColumn("Tratamiento: sertralina 50mg");

        // Corrompemos el payload cifrado (última posición del Base64) simulando
        // una clave distinta o un dato dañado en la base.
        String corrupto = cifrado.substring(0, cifrado.length() - 4) + "XXXX";

        assertThrows(IllegalStateException.class, () -> encryptor.convertToEntityAttribute(corrupto));
    }
}
