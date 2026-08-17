export default function ErrorBanner({ message }) {
    if (!message) return null;
    return (
        <div className="animate-fadeInUp" style={{ background: 'var(--destructive-light)', color: 'var(--destructive)', padding: '1rem 1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {message}
        </div>
    );
}
