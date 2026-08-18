import { createContext, useCallback, useState } from 'react';

export const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [request, setRequest] = useState(null);

    const confirm = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            setRequest({ message, title: options.title || 'Confirmar acción', resolve });
        });
    }, []);

    const handleClose = (result) => {
        request?.resolve(result);
        setRequest(null);
    };

    return (
        <ConfirmContext.Provider value={{ request, confirm, handleClose }}>
            {children}
        </ConfirmContext.Provider>
    );
}
