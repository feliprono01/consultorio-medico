export default function SectionHeader({ title, subtitle }) {
    return (
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ margin: 0, color: 'var(--text-header)', fontSize: '1.1rem' }}>{title}</h3>
            {subtitle && <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{subtitle}</p>}
        </div>
    );
}
