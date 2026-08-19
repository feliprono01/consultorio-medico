import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/authService';
import { useAuth } from '../../hooks/useAuth';
import './Login.css'; // Import specific CSS for login

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
            const { role } = response.data;
            login(role);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError('Credenciales inválidas o error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            {/* Left Column: Brand Illustration */}
            <div className="login-left">
                <img src="/login-bg.png" alt="Medical abstract" className="login-left-bg" />
                <div className="login-left-overlay"></div>
                
                <div className="login-brand-info">
                    <div className="login-brand-logo">
                        <div className="login-brand-logo-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        Consultorio Médico
                    </div>
                </div>

                <div className="login-quote">
                    <h2>Gestión clínica<br/>inteligente y moderna.</h2>
                    <p>Optimice el tiempo de sus consultas y mejore la atención a sus pacientes con nuestro sistema integral de salud.</p>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="login-right">
                <div className="login-card-modern">
                    <div className="login-header">
                        <h1>Bienvenido de nuevo</h1>
                        <p>Ingrese sus credenciales para continuar</p>
                    </div>

                    {error && (
                        <div style={{ background: 'var(--destructive-light)', color: 'var(--destructive)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', border: '1px solid #FECACA' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Username Floating Input */}
                        <div className="input-floating">
                            <input
                                type="text"
                                id="username"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <div className="input-floating-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <label htmlFor="username">Usuario</label>
                        </div>

                        {/* Password Floating Input */}
                        <div className="input-floating">
                            <input
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <div className="input-floating-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><circle cx="12" cy="16" r="1" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <label htmlFor="password">Contraseña</label>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                            <label className="custom-checkbox-container">
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Recordarme</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className={`btn-login-submit ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span>Ingresando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Iniciar Sesión</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
