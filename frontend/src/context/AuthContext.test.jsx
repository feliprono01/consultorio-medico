import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

vi.mock('../api/axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

function TestConsumer() {
    const { isAuthenticated, role, login, logout } = useAuth();
    return (
        <div>
            <span data-testid="auth-state">{isAuthenticated ? `logueado:${role}` : 'sin-sesion'}</span>
            <button onClick={() => login('ADMIN')}>login</button>
            <button onClick={() => logout()}>logout</button>
        </div>
    );
}

function renderWithProvider() {
    return render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>
    );
}

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        api.get.mockReset();
        api.post.mockReset();
        // Por defecto, sin sesión previa, /auth/me no se llega a invocar en el flujo relevante
        api.get.mockResolvedValue({ data: { role: 'USER' } });
        api.post.mockResolvedValue({});
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('login guarda el rol y el flag de sesión en localStorage', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByText('login'));

        expect(screen.getByTestId('auth-state')).toHaveTextContent('logueado:ADMIN');
        expect(localStorage.getItem('isAuthenticated')).toBe('true');
        expect(localStorage.getItem('role')).toBe('ADMIN');
    });

    it('logout limpia el estado y localStorage, y llama a POST /auth/logout', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByText('login'));
        expect(screen.getByTestId('auth-state')).toHaveTextContent('logueado:ADMIN');

        await user.click(screen.getByText('logout'));

        expect(api.post).toHaveBeenCalledWith('/auth/logout');
        expect(screen.getByTestId('auth-state')).toHaveTextContent('sin-sesion');
        expect(localStorage.getItem('isAuthenticated')).toBeNull();
        expect(localStorage.getItem('role')).toBeNull();
    });

    it('si localStorage dice que hay sesión pero /auth/me devuelve 401, limpia el estado', async () => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('role', 'USER');
        api.get.mockRejectedValue({ response: { status: 401 } });

        renderWithProvider();

        await waitFor(() => {
            expect(screen.getByTestId('auth-state')).toHaveTextContent('sin-sesion');
        });
        expect(localStorage.getItem('isAuthenticated')).toBeNull();
    });

    it('si localStorage dice que hay sesión y /auth/me la confirma, mantiene el estado', async () => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('role', 'USER');
        api.get.mockResolvedValue({ data: { role: 'USER' } });

        renderWithProvider();

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/auth/me');
        });
        expect(screen.getByTestId('auth-state')).toHaveTextContent('logueado:USER');
    });
});
