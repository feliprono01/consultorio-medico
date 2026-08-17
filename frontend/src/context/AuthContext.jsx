import { createContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // El JWT viaja en HttpOnly cookie — el navegador lo maneja automáticamente.
    // Solo guardamos el rol (no sensible) y un flag de sesión activa en localStorage.
    const [role, setRole] = useState(() => localStorage.getItem('role'));
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => localStorage.getItem('isAuthenticated') === 'true'
    );
    // Mientras no se confirmó contra el backend si la cookie sigue vigente,
    // evitamos que las rutas protegidas decidan solo con el flag de localStorage.
    const [checkingSession, setCheckingSession] = useState(true);

    const login = useCallback((newRole) => {
        localStorage.setItem('role', newRole);
        localStorage.setItem('isAuthenticated', 'true');
        setRole(newRole);
        setIsAuthenticated(true);
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem('role');
        localStorage.removeItem('isAuthenticated');
        setRole(null);
        setIsAuthenticated(false);
    }, []);

    const logout = useCallback(async () => {
        try {
            // Llamar al backend para que limpie la cookie HttpOnly
            // (JS no puede borrar cookies HttpOnly por sí solo)
            await api.post('/auth/logout');
        } catch {
            // Si el servidor no responde, igual limpiamos el estado local
        } finally {
            clearSession();
        }
    }, [clearSession]);

    useEffect(() => {
        // Si localStorage dice que hay sesión pero la cookie httpOnly ya expiró,
        // sin esta verificación la UI mostraría la app como logueada hasta que
        // fallara el primer request. Confirmamos contra el backend al montar.
        if (!isAuthenticated) {
            setCheckingSession(false);
            return;
        }

        api.get('/auth/me')
            .then((res) => {
                if (res.data?.role && res.data.role !== role) {
                    login(res.data.role);
                }
            })
            .catch(() => {
                clearSession();
            })
            .finally(() => {
                setCheckingSession(false);
            });
        // Solo se ejecuta al montar el provider.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider value={{ role, isAuthenticated, checkingSession, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
