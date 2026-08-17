import FieldError from '../common/FieldError';

export default function UserCreateForm({ newUser, setNewUser, fieldErrors, clearError, isCreating, onSubmit }) {
    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                </div>
                <h3 style={{ margin: 0 }}>Crear Nuevo Usuario</h3>
            </div>

            <form onSubmit={onSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div className="form-group">
                        <label>Nombre *</label>
                        <input
                            className={`form-input${fieldErrors.nombre ? ' input-error' : ''}`}
                            value={newUser.nombre || ''}
                            onChange={e => { setNewUser({ ...newUser, nombre: e.target.value }); clearError('nombre'); }}
                            placeholder="Juan"
                        />
                        <FieldError message={fieldErrors.nombre} />
                    </div>
                    <div className="form-group">
                        <label>Apellido *</label>
                        <input
                            className={`form-input${fieldErrors.apellido ? ' input-error' : ''}`}
                            value={newUser.apellido || ''}
                            onChange={e => { setNewUser({ ...newUser, apellido: e.target.value }); clearError('apellido'); }}
                            placeholder="Pérez"
                        />
                        <FieldError message={fieldErrors.apellido} />
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
                        <FieldError message={fieldErrors.username} />
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
                        <FieldError message={fieldErrors.password} />
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
                        <FieldError message={fieldErrors.confirmPassword} />
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
    );
}
