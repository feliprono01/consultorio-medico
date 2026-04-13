import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const savedUser = localStorage.getItem('savedUsername');
        if (savedUser) {
            setUsername(savedUser);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (rememberMe) {
            localStorage.setItem('savedUsername', username);
        } else {
            localStorage.removeItem('savedUsername');
        }

        try {
            const response = await authService.login(username, password);
            const { token, role } = response.data;

            // Persistir sesión y actualizar estado global
            login(token, role);

            // Redirigir al dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Credenciales inválidas o error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Background decorations */}
            <div className="login-bg-decoration login-bg-decoration-1"></div>
            <div className="login-bg-decoration login-bg-decoration-2"></div>
            <div className="login-bg-decoration login-bg-decoration-3"></div>

            <div className="login-card">
                {/* Logo/Icon */}
                <div className="login-logo">
                    <div className="login-logo-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                </div>

                <h1 className="login-title">Bienvenido</h1>
                <p className="login-subtitle">Consultorio Médico</p>

                {error && (
                    <div className="login-error">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className={`login-input-group ${focusedField === 'username' ? 'focused' : ''} ${username ? 'has-value' : ''}`}>
                        <div className="login-input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="username"
                            className="login-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onFocus={() => setFocusedField('username')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Usuario"
                            required
                        />
                    </div>

                    <div className={`login-input-group ${focusedField === 'password' ? 'focused' : ''} ${password ? 'has-value' : ''}`}>
                        <div className="login-input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <circle cx="12" cy="16" r="1" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <input
                            type="password"
                            id="password"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Contraseña"
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                        <label htmlFor="rememberMe" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            Recordar usuario
                        </label>
                    </div>

                    <button
                        type="submit"
                        className={`login-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="login-spinner"></span>
                                <span>Ingresando...</span>
                            </>
                        ) : (
                            <>
                                <span>Iniciar Sesión</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Sistema de Gestión de Consultas</p>
                </div>
            </div>
        </div>
    );
}

