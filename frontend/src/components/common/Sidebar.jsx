import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="sidebar-glass">
            <div className="sidebar-header">
                <h3>Consultorio</h3>
            </div>

            <nav className="sidebar-nav">
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                    Panel
                </Link>
                <Link to="/pacientes" className={`nav-link ${isActive('/pacientes') ? 'active' : ''}`}>
                    Pacientes
                </Link>
                <Link to="/consultas" className={`nav-link ${isActive('/consultas') ? 'active' : ''}`}>
                    Consultas
                </Link>
                {role === 'ADMIN' && (
                    <>
                        <Link to="/usuarios" className={`nav-link ${isActive('/usuarios') ? 'active' : ''}`}>
                            Gestión Usuarios
                        </Link>
                        <Link to="/backups" className={`nav-link ${isActive('/backups') ? 'active' : ''}`}>
                            Backups
                        </Link>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
