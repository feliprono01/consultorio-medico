import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal genérico (overlay + panel glass), extraído del modal de reset
 * password de UserManagementPage. `header` es JSX libre (ícono + título),
 * `children` es el cuerpo. Cierra al hacer click afuera del panel, con
 * Escape, o llamando a onClose. Mientras está abierto: mueve el foco
 * adentro, lo mantiene atrapado (Tab no se escapa del panel), y lo
 * devuelve al elemento que lo abrió al cerrarse — accesible por teclado.
 */
export default function Modal({ isOpen, onClose, header, children, maxWidth = '420px' }) {
    const panelRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        triggerRef.current = document.activeElement;
        const panel = panelRef.current;
        const focusables = panel?.querySelectorAll(FOCUSABLE_SELECTOR);
        (focusables?.[0] || panel)?.focus();

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key !== 'Tab' || !panel) return;

            const nodes = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR));
            if (nodes.length === 0) return;
            const first = nodes[0];
            const last = nodes[nodes.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            triggerRef.current?.focus?.();
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                className="glass-panel"
                style={{ width: '100%', maxWidth, padding: '2rem', animation: 'scaleUp 0.2s ease-out' }}
                onClick={(e) => e.stopPropagation()}
            >
                {header}
                {children}
            </div>
        </div>
    );
}
