export default function IconBtn({ onClick, title, color, bg, border, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            style={{
                padding: '0.45rem 0.55rem',
                borderRadius: '8px',
                border: `1.5px solid ${border}`,
                background: bg,
                color,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.9)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
        >
            {children}
        </button>
    );
}
