import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ requiredRole }) {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // La sesión es válida pero el usuario no tiene el rol requerido para esta
    // sección (ej. un USER intentando entrar a /usuarios) — no lo desloguea,
    // solo lo manda de vuelta al dashboard.
    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
