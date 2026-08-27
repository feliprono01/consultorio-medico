export default function TabButton({ label, icon, active, onClick, dirty = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: '0.6rem 1.25rem',
                background: active ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '99px',
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--primary-darker)' : 'var(--text-muted)',
                boxShadow: active ? '0 2px 8px rgba(8, 145, 178, 0.15)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontFamily: 'Figtree, sans-serif',
                fontSize: '0.95rem'
            }}
        >
            {icon}
            {label}
            {dirty && (
                <span
                    title="Cambios sin guardar"
                    style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: '#f59e0b', flexShrink: 0,
                        boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.25)',
                    }}
                />
            )}
        </button>
    );
}
