import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const icons = {
    dashboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
    ),
    patients: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    consultations: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    ),
    users: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
            <line x1="12" y1="16" x2="12" y2="21" /><line x1="9" y1="18" x2="15" y2="18" />
        </svg>
    ),
    backup: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
            <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10" />
            <polyline points="16 16 20 20 20 16" /><line x1="20" y1="20" x2="16" y2="20" />
        </svg>
    ),
    logout: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
};

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <aside className="sidebar-glass">
            {/* Logo */}
            <div className="sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
                    <div style={{
                        width: '38px', height: '38px',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                        borderRadius: '10px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'white', flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.35)'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <h3 style={{ margin: 0 }}>Consultorio</h3>
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.5rem 0.25rem' }}>
                    General
                </p>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                    {icons.dashboard} Panel
                </Link>
                <Link to="/pacientes" className={`nav-link ${isActive('/pacientes') ? 'active' : ''}`}>
                    {icons.patients} Pacientes
                </Link>
                <Link to="/consultas" className={`nav-link ${isActive('/consultas') ? 'active' : ''}`}>
                    {icons.consultations} Consultas
                </Link>

                {role === 'ADMIN' && (
                    <>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '1rem 0 0.5rem 0.25rem' }}>
                            Administración
                        </p>
                        <Link to="/usuarios" className={`nav-link ${isActive('/usuarios') ? 'active' : ''}`}>
                            {icons.users} Gestión Usuarios
                        </Link>
                        <Link to="/backups" className={`nav-link ${isActive('/backups') ? 'active' : ''}`}>
                            {icons.backup} Backups
                        </Link>
                    </>
                )}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', gap: '0.5rem' }}>
                    {icons.logout} Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
