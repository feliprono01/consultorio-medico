import { useEffect, useState } from 'react';
import { userService } from '../../api/userService';
import { useFormValidation, rules } from '../../hooks/useFormValidation';

/* ── Avatar Component ── */
const Avatar = ({ nombre, apellido, role }) => {
    const initials = `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase() || 'U';
    const isAd = role === 'ADMIN';
    const bg = isAd ? '#0891B2' : '#059669';
    const fg = isAd ? '#CFFAFE' : '#D1FAE5';
    
    return (
        <div style={{
            width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${bg} 0%, ${fg} 100%)`,
            border: `2px solid ${bg}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: bg, fontSize: '0.85rem', fontWeight: 800,
            fontFamily: 'Figtree, sans-serif',
        }}>
            {initials}
        </div>
    );
};

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', confirmPassword: '', role: 'USER', nombre: '', apellido: '', dni: '', matricula: '' });
    const [message, setMessage] = useState('');
    const [msgType, setMsgType] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Reset Password Modal State
    const [resetModal, setResetModal] = useState({ isOpen: false, userId: null, username: '', newPassword: '' });

    const userRules = {
        nombre:           rules.requerido('El nombre'),
        apellido:         rules.requerido('El apellido'),
        username:         rules.emailRequerido(),
        password:         rules.passwordMinLength(),
        confirmPassword:  rules.passwordMatch(),
    };
    const { errors: fieldErrors, validate, clearError } = useFormValidation(userRules);
    const FE = ({ field }) => fieldErrors[field]
        ? <span style={{ color: 'var(--destructive)', fontSize: '0.78rem', marginTop: '0.3rem', display: 'block' }}>{fieldErrors[field]}</span>
        : null;

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await userService.getAll();
            setUsers(res.data);
            setIsAdmin(true);
        } catch (err) {
            console.error("Acceso denegado o error", err);
            setMessage("No tienes permisos para ver esta página.");
            setMsgType('error');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setMessage('');
        
        if (!validate(newUser)) return;
        if (newUser.password !== newUser.confirmPassword) return;

        setIsCreating(true);
        try {
            await userService.create({
                username: newUser.username,
                password: newUser.password,
                role: newUser.role,
                nombre: newUser.nombre,
                apellido: newUser.apellido,
                dni: newUser.dni,
                matricula: newUser.matricula
            });
            setNewUser({ username: '', password: '', confirmPassword: '', role: 'USER', nombre: '', apellido: '', dni: '', matricula: '' });
            setMessage('Usuario creado exitosamente.');
            setMsgType('success');
            loadUsers();
        } catch (err) {
            setMessage('Error al crear usuario. El correo podría estar en uso.');
            setMsgType('error');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id, username) => {
        if (window.confirm(`¿Seguro que desea eliminar al usuario ${username}? Esta acción no se puede deshacer.`)) {
            try {
                await userService.delete(id);
                setMessage('Usuario eliminado correctamente.');
                setMsgType('success');
                loadUsers();
            } catch (err) {
                setMessage('Error al eliminar usuario.');
                setMsgType('error');
            }
        }
    };

    const openResetModal = (id, username) => {
        setResetModal({ isOpen: true, userId: id, username, newPassword: '' });
        setMessage('');
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (!resetModal.newPassword) return;

        try {
            await userService.resetPassword(resetModal.userId, resetModal.newPassword);
            setMessage(`Contraseña actualizada para ${resetModal.username}.`);
            setMsgType('success');
            setResetModal({ isOpen: false, userId: null, username: '', newPassword: '' });
        } catch (err) {
            setMessage('Error al cambiar la contraseña.');
            setMsgType('error');
        }
    };

    if (!isAdmin && message) {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto' }} className="glass-panel text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="1.5" style={{ margin: '0 auto 1rem' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <h2 style={{ color: 'var(--destructive)', marginBottom: '0.5rem' }}>Acceso Denegado</h2>
                <p style={{ color: 'var(--text-muted)' }}>{message}</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ marginBottom: '0.25rem' }}>Gestión de Usuarios</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                    Administra los accesos, médicos y roles de la plataforma
                </p>
            </div>

            {/* Mensajes Globales */}
            {message && !resetModal.isOpen && (
                <div className="animate-fadeInUp" style={{
                    padding: '1rem 1.5rem',
                    marginBottom: '1.5rem',
                    borderRadius: '8px',
                    backgroundColor: msgType === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: msgType === 'error' ? 'var(--destructive)' : 'var(--accent)',
                    border: `1px solid ${msgType === 'error' ? '#FECACA' : '#A7F3D0'}`,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {msgType === 'success' ? (
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    ) : (
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    )}
                    {message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                
                {/* Formulario de Creación */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                        </div>
                        <h3 style={{ margin: 0 }}>Crear Nuevo Usuario</h3>
                    </div>

                    <form onSubmit={handleCreate}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    className={`form-input${fieldErrors.nombre ? ' input-error' : ''}`}
                                    value={newUser.nombre || ''}
                                    onChange={e => { setNewUser({ ...newUser, nombre: e.target.value }); clearError('nombre'); }}
                                    placeholder="Juan"
                                />
                                <FE field="nombre" />
                            </div>
                            <div className="form-group">
                                <label>Apellido *</label>
                                <input
                                    className={`form-input${fieldErrors.apellido ? ' input-error' : ''}`}
                                    value={newUser.apellido || ''}
                                    onChange={e => { setNewUser({ ...newUser, apellido: e.target.value }); clearError('apellido'); }}
                                    placeholder="Pérez"
                                />
                                <FE field="apellido" />
                            </div>
                            <div className="form-group">
                                <label>DNI</label>
                                <input
                                    className="form-input"
                                    value={newUser.dni || ''}
                                    onChange={e => setNewUser({ ...newUser, dni: e.target.value })}
                                    placeholder="12345678"
                                />
                            </div>
                            <div className="form-group">
                                <label>Matrícula</label>
                                <input
                                    className="form-input"
                                    value={newUser.matricula || ''}
                                    onChange={e => setNewUser({ ...newUser, matricula: e.target.value })}
                                    placeholder="M.N. 1234"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label>Usuario (Email) *</label>
                                <div style={{ position: 'relative' }}>
                                    <svg style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    <input
                                        className={`form-input${fieldErrors.username ? ' input-error' : ''}`}
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={newUser.username}
                                        onChange={e => { setNewUser({ ...newUser, username: e.target.value }); clearError('username'); }}
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                                <FE field="username" />
                            </div>
                            <div className="form-group">
                                <label>Rol del Sistema</label>
                                <select
                                    className="form-input"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="USER">Médico / Usuario Estándar</option>
                                    <option value="ADMIN">Administrador (Acceso Total)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label>Contraseña *</label>
                                <div style={{ position: 'relative' }}>
                                    <svg style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    <input
                                        type="password"
                                        className={`form-input${fieldErrors.password ? ' input-error' : ''}`}
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={newUser.password}
                                        onChange={e => { setNewUser({ ...newUser, password: e.target.value }); clearError('password'); }}
                                        placeholder="••••••"
                                    />
                                </div>
                                <FE field="password" />
                            </div>
                            <div className="form-group">
                                <label>Confirmar Contraseña *</label>
                                <div style={{ position: 'relative' }}>
                                    <svg style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    <input
                                        type="password"
                                        className={`form-input${fieldErrors.confirmPassword ? ' input-error' : ''}`}
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={newUser.confirmPassword}
                                        onChange={e => { setNewUser({ ...newUser, confirmPassword: e.target.value }); clearError('confirmPassword'); }}
                                        placeholder="••••••"
                                    />
                                </div>
                                <FE field="confirmPassword" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <button type="submit" className="btn" disabled={isCreating} style={{ minWidth: '180px', gap: '0.5rem' }}>
                                {isCreating ? 'Procesando...' : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                                        Registrar Usuario
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Lista de Usuarios */}
                <div className="glass-panel" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.4)' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Directorio de Usuarios</h3>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Usuario</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Contacto / Email</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Rol</th>
                                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                            <Avatar nombre={u.nombre || u.username} apellido={u.apellido} role={u.role} />
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, fontFamily: 'Figtree, sans-serif', color: 'var(--text-header)' }}>
                                                    {u.nombre || u.apellido ? `${u.nombre} ${u.apellido}` : 'Sin Nombre'}
                                                </p>
                                                {(u.matricula || u.dni) && (
                                                    <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {u.matricula ? `MN: ${u.matricula}` : ''} {u.matricula && u.dni ? ' | ' : ''} {u.dni ? `DNI: ${u.dni}` : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {u.username}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-accent'}`}>
                                            {u.role === 'ADMIN' ? 'Administrador' : 'Médico'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => openResetModal(u.id, u.username)}
                                                className="btn btn-secondary"
                                                title="Cambiar Contraseña"
                                                style={{ padding: '0.45rem 0.55rem' }}
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u.id, u.username)}
                                                className="btn"
                                                title="Eliminar Usuario"
                                                style={{ padding: '0.45rem 0.55rem', background: 'var(--destructive-light)', color: 'var(--destructive)', border: '1px solid #FECACA' }}
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No hay usuarios registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Reset Password (Glassmorphism) */}
            {resetModal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2rem', animation: 'scaleUp 0.2s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Forzar Cambio de Clave</h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Usuario: {resetModal.username}</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleResetSubmit}>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label>Nueva Contraseña</label>
                                <div style={{ position: 'relative' }}>
                                    <svg style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                                    <input
                                        type="password"
                                        className="form-input"
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={resetModal.newPassword}
                                        onChange={e => setResetModal({ ...resetModal, newPassword: e.target.value })}
                                        placeholder="Ingresa la nueva clave..."
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setResetModal({ ...resetModal, isOpen: false })}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn" disabled={!resetModal.newPassword}>
                                    Actualizar Clave
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
