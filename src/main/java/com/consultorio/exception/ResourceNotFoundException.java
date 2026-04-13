package com.consultorio.exception;

/**
 * Excepción personalizada para cuando no se encuentra un recurso.
 * Se lanza cuando se busca una entidad por ID y no existe.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s no encontrado con %s: '%s'", resourceName, fieldName, fieldValue));
    }
}
