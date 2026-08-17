import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../../hooks/useAuth';

vi.mock('../../hooks/useAuth');

function renderWithRoute({ requiredRole, initialEntry = '/protegida' } = {}) {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/login" element={<div>Pantalla de login</div>} />
                <Route path="/dashboard" element={<div>Pantalla de dashboard</div>} />
                <Route element={<ProtectedRoute requiredRole={requiredRole} />}>
                    <Route path="/protegida" element={<div>Contenido protegido</div>} />
                </Route>
            </Routes>
        </MemoryRouter>
    );
}

describe('ProtectedRoute', () => {
    it('redirige a /login cuando no hay sesión', () => {
        useAuth.mockReturnValue({ isAuthenticated: false, role: null });

        renderWithRoute();

        expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    });

    it('redirige a /dashboard cuando el rol no coincide con requiredRole', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, role: 'USER' });

        renderWithRoute({ requiredRole: 'ADMIN' });

        expect(screen.getByText('Pantalla de dashboard')).toBeInTheDocument();
    });

    it('renderiza el contenido cuando el rol coincide con requiredRole', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, role: 'ADMIN' });

        renderWithRoute({ requiredRole: 'ADMIN' });

        expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    });

    it('renderiza el contenido cuando hay sesión y no se pide un rol específico', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, role: 'USER' });

        renderWithRoute();

        expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    });
});
