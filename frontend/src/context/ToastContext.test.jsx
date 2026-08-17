import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from './ToastContext';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/common/ToastContainer';

function TestConsumer() {
    const toast = useToast();
    return (
        <div>
            <button onClick={() => toast.error('Algo falló')}>disparar-error</button>
            <button onClick={() => toast.success('Todo bien')}>disparar-success</button>
        </div>
    );
}

function renderWithProvider() {
    return render(
        <ToastProvider>
            <ToastContainer />
            <TestConsumer />
        </ToastProvider>
    );
}

describe('ToastContext', () => {
    it('muestra un toast de error al dispararlo', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByText('disparar-error'));

        expect(screen.getByRole('alert')).toHaveTextContent('Algo falló');
    });

    it('muestra un toast de éxito al dispararlo', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByText('disparar-success'));

        expect(screen.getByRole('alert')).toHaveTextContent('Todo bien');
    });

    it('se puede cerrar haciendo click en el toast', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByText('disparar-error'));
        expect(screen.getByRole('alert')).toBeInTheDocument();

        await user.click(screen.getByRole('alert'));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    it('se auto-descarta pasado el tiempo de espera', () => {
        vi.useFakeTimers();
        try {
            renderWithProvider();

            fireEvent.click(screen.getByText('disparar-error'));
            expect(screen.getByRole('alert')).toBeInTheDocument();

            act(() => {
                vi.advanceTimersByTime(5100);
            });

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        } finally {
            vi.useRealTimers();
        }
    });
});
