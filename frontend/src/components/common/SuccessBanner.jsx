export default function SuccessBanner({ message }) {
    if (!message) return null;
    return (
        <div className="animate-fadeInUp" style={{ background: 'var(--accent-light)', color: '#065f46', padding: '1rem 1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            {message}
        </div>
    );
}
