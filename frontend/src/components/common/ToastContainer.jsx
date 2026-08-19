import { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';

const STYLES = {
    error: { bg: 'var(--destructive-light)', color: 'var(--destructive)', border: '#FECACA' },
    success: { bg: 'var(--accent-light)', color: '#065f46', border: '#A7F3D0' },
};

export default function ToastContainer() {
    const ctx = useContext(ToastContext);
    if (!ctx) return null;
    const { toasts, dismiss } = ctx;

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 10000,
            display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '360px',
        }}>
            {toasts.map((t) => {
                const s = STYLES[t.type] ?? STYLES.error;
                return (
                    <div
                        key={t.id}
                        className="animate-fadeInUp"
                        role="alert"
                        style={{
                            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                            padding: '0.85rem 1.1rem', borderRadius: 'var(--radius)',
                            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                            fontWeight: 500, fontSize: '0.9rem', boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                        }}
                    >
                        {t.type === 'success' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        )}
                        <span style={{ flex: 1 }}>{t.message}</span>
                        <button
                            type="button"
                            onClick={() => dismiss(t.id)}
                            aria-label="Cerrar notificación"
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'inherit', opacity: 0.6, padding: 0, marginTop: '1px',
                                flexShrink: 0, lineHeight: 1,
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
