import { createContext, useCallback, useRef, useState } from 'react';

export const ToastContext = createContext(null);

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback((type, message) => {
        const id = nextId.current++;
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    }, [dismiss]);

    const toast = {
        error: useCallback((message) => push('error', message), [push]),
        success: useCallback((message) => push('success', message), [push]),
    };

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
        </ToastContext.Provider>
    );
}
