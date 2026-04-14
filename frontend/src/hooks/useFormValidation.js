import { useState } from 'react';

/**
 * Hook reutilizable para validación de formularios.
 * @param {Object} rules - Mapa de campo → función validadora que retorna string de error o ''
 */
export function useFormValidation(rules) {
    const [errors, setErrors] = useState({});

    const validate = (data) => {
        const newErrors = {};
        Object.entries(rules).forEach(([field, ruleFn]) => {
            const error = ruleFn(data[field], data);
            if (error) newErrors[field] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // true = válido
    };

    const clearError = (field) => {
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const clearAll = () => setErrors({});

    return { errors, validate, clearError, clearAll };
}

// ─── Reglas reutilizables ──────────────────────────────────────────

export const rules = {
    requerido: (label) => (val) =>
        !val || !String(val).trim() ? `${label} es obligatorio.` : '',

    minLength: (label, min) => (val) =>
        val && String(val).trim().length < min ? `${label} debe tener al menos ${min} caracteres.` : '',

    dni: () => (val) =>
        !val ? 'El DNI es obligatorio.' :
        !/^\d{7,8}$/.test(String(val).trim()) ? 'El DNI debe tener 7 u 8 dígitos numéricos.' : '',

    email: () => (val) =>
        val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim())
            ? 'El email no tiene un formato válido.' : '',

    emailRequerido: () => (val) =>
        !val || !String(val).trim() ? 'El email es obligatorio.' :
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim()) ? 'El email no tiene formato válido.' : '',

    telefono: () => (val) =>
        val && !/^\d+$/.test(String(val).trim()) ? 'El teléfono solo puede contener números.' : '',

    passwordMinLength: () => (val) =>
        !val ? 'La contraseña es obligatoria.' :
        String(val).length < 6 ? 'La contraseña debe tener al menos 6 caracteres.' : '',

    passwordMatch: () => (val, data) =>
        val !== data.password ? 'Las contraseñas no coinciden.' : '',

    requeridoSelect: (label) => (val) =>
        !val ? `Debe seleccionar ${label}.` : '',
};
