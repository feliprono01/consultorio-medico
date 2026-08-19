import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/* ── Icons ── */
const Icon = ({ children }) => (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {children}
    </span>
);

const icons = {
    dashboard: (
        <Icon><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg></Icon>
    ),
    patients: (
        <Icon><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg></Icon>
    ),
    consultations: (
        <Icon><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg></Icon>
    ),
    users: (
        <Icon><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
            <line x1="12" y1="16" x2="12" y2="21" /><line x1="9" y1="18" x2="15" y2="18" />
        </svg></Icon>
    ),
    backup: (
        <Icon><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg></Icon>
    ),
    logout: (
        <Icon><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg></Icon>
    ),
};

/* ── Nav Section Label ── */
const SectionLabel = ({ children }) => (
    <p style={{
        fontSize: '0.68rem',
        fontFamily: 'Figtree, sans-serif',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.09em',
        margin: '1.25rem 0 0.4rem 0.75rem',
        opacity: 0.7,
    }}>
        {children}
    </p>
);

/* ── Nav Item ── */
const NavItem = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={`nav-link ${active ? 'active' : ''}`}
        style={{ paddingLeft: '0.875rem' }}
        aria-current={active ? 'page' : undefined}
    >
        {icon}
        <span>{label}</span>
        {active && (
            <span style={{
                marginLeft: 'auto',
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: 'var(--primary)',
                flexShrink: 0,
            }} />
        )}
    </Link>
);

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <aside className="sidebar-glass">
            {/* ── Brand ── */}
            <div className="sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Logo icon */}
                    <div style={{
                        width: '40px', height: '40px', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-darker) 100%)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 14px rgba(8, 145, 178, 0.4)',
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    {/* Brand text */}
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Consultorio</h3>
                        <p style={{
                            margin: 0, fontSize: '0.7rem',
                            color: 'var(--primary)', fontWeight: 600,
                            fontFamily: 'Figtree, sans-serif',
                            letterSpacing: '0.02em',
                        }}>
                            Sistema Médico
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Navigation ── */}
            <nav className="sidebar-nav">
                <SectionLabel>General</SectionLabel>
                <NavItem to="/dashboard"  icon={icons.dashboard}     label="Panel"     active={isActive('/dashboard')} />
                <NavItem to="/pacientes"  icon={icons.patients}      label="Pacientes" active={isActive('/pacientes')} />
                <NavItem to="/consultas"  icon={icons.consultations} label="Consultas" active={isActive('/consultas')} />

                {role === 'ADMIN' && (
                    <>
                        <SectionLabel>Administración</SectionLabel>
                        <NavItem to="/usuarios" icon={icons.users}  label="Gestión Usuarios" active={isActive('/usuarios')} />
                        <NavItem to="/backups"  icon={icons.backup} label="Backups"           active={isActive('/backups')} />
                    </>
                )}
            </nav>

            {/* ── Footer / Logout ── */}
            <div className="sidebar-footer">
                {/* Role badge */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.75rem',
                    background: 'var(--muted)',
                    borderRadius: 'var(--radius)',
                    marginBottom: '0.75rem',
                }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.8rem', fontWeight: 700,
                        fontFamily: 'Figtree, sans-serif', flexShrink: 0,
                    }}>
                        {role ? role[0].toUpperCase() : 'U'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-header)', fontFamily: 'Figtree, sans-serif' }}>
                            {role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                        </p>
                        <span style={{
                            fontSize: '0.68rem', fontWeight: 600,
                            color: 'var(--primary)',
                            fontFamily: 'Figtree, sans-serif',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            {role}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%', padding: '0.65rem 1rem',
                        border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        fontFamily: 'Figtree, sans-serif',
                        fontSize: '0.85rem', fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--destructive-light)';
                        e.currentTarget.style.borderColor = 'var(--destructive)';
                        e.currentTarget.style.color = 'var(--destructive)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    {icons.logout} Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
