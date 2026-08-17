/**
 * Modal genérico (overlay + panel glass), extraído del modal de reset
 * password de UserManagementPage. `header` es JSX libre (ícono + título),
 * `children` es el cuerpo. Cierra al hacer click afuera del panel.
 */
export default function Modal({ isOpen, onClose, header, children, maxWidth = '420px' }) {
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
