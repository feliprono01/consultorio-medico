import Avatar from '../common/Avatar';

export default function UsersTable({ users, onResetPassword, onDelete }) {
    return (
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
                                        onClick={() => onResetPassword(u.id, u.username)}
                                        className="btn btn-secondary"
                                        title="Cambiar Contraseña"
                                        style={{ padding: '0.45rem 0.55rem' }}
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                                    </button>
                                    <button
                                        onClick={() => onDelete(u.id, u.username)}
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
    );
}
