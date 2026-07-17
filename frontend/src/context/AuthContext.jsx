import { createContext, useState, useCallback } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // El JWT viaja en HttpOnly cookie — el navegador lo maneja automáticamente.
    // Solo guardamos el rol (no sensible) y un flag de sesión activa en localStorage.
    const [role, setRole] = useState(() => localStorage.getItem('role'));
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => localStorage.getItem('isAuthenticated') === 'true'
    );

    const login = useCallback((newRole) => {
        localStorage.setItem('role', newRole);
        localStorage.setItem('isAuthenticated', 'true');
        setRole(newRole);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(async () => {
        try {
            // Llamar al backend para que limpie la cookie HttpOnly
            // (JS no puede borrar cookies HttpOnly por sí solo)
            await api.post('/auth/logout');
        } catch {
            // Si el servidor no responde, igual limpiamos el estado local
        } finally {
            localStorage.removeItem('role');
            localStorage.removeItem('isAuthenticated');
            setRole(null);
            setIsAuthenticated(false);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ role, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
