const ROLE_COLORS = {
    ADMIN: ['#0891B2', '#CFFAFE'],
    DEFAULT: ['#059669', '#D1FAE5'],
};

const NAME_PALETTE = [
    ['#0891B2', '#CFFAFE'], ['#059669', '#D1FAE5'],
    ['#7C3AED', '#EDE9FE'], ['#D97706', '#FEF3C7'],
    ['#DB2777', '#FCE7F3'],
];

/**
 * Avatar de iniciales. Si se pasa `role`, el color depende del rol
 * (ADMIN vs. resto); si no, rota por un paleta fija según la inicial
 * del nombre — mismos dos comportamientos que existían duplicados en
 * UserManagementPage y ConsultationListPage.
 */
export default function Avatar({ nombre, apellido, role, size = 38 }) {
    const initials = `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase() || 'U';

    let bg, fg;
    if (role) {
        [bg, fg] = role === 'ADMIN' ? ROLE_COLORS.ADMIN : ROLE_COLORS.DEFAULT;
    } else {
        const idx = (nombre?.charCodeAt(0) ?? 0) % NAME_PALETTE.length;
        [bg, fg] = NAME_PALETTE[idx];
    }

    return (
        <div style={{
            width: `${size}px`, height: `${size}px`, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${bg} 0%, ${fg} 100%)`,
            border: `2px solid ${bg}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: bg, fontSize: '0.8rem', fontWeight: 800,
            fontFamily: 'Figtree, sans-serif',
        }}>
            {initials}
        </div>
    );
}
