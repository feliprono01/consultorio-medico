import { useEffect, useState } from 'react';
import { userService } from '../../api/userService';
import { useFormValidation, rules } from '../../hooks/useFormValidation';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', confirmPassword: '', role: 'USER', nombre: '', apellido: '', dni: '', matricula: '' });
    const [message, setMessage] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

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
        ? <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.2rem', display: 'block' }}>{fieldErrors[field]}</span>
        : null;

    useEffect(() => {
        // En un caso real, decodificaríamos el JWT para ver el rol.
        // Aquí intentaremos cargar usuarios; si falla con 403, es que no somos admin.
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
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!validate(newUser)) return;

        if (newUser.password !== newUser.confirmPassword) {
            return; // ya lo maneja la regla passwordMatch
        }

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
            setMessage('Usuario creado con éxito');
            loadUsers();
        } catch (err) {
            setMessage('Error al crear usuario. El nombre podría estar en uso.');
        }
    };

    const handleDelete = async (id, username) => {
        if (window.confirm(`¿Seguro que desea eliminar al usuario ${username}?`)) {
            try {
                await userService.delete(id);
                setMessage('Usuario eliminado');
                loadUsers();
            } catch (err) {
                setMessage('Error al eliminar usuario');
            }
        }
    };

    // Open Modal
    const openResetModal = (id, username) => {
        setResetModal({ isOpen: true, userId: id, username, newPassword: '' });
        setMessage('');
    };

    // Submit Reset
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (!resetModal.newPassword) return;

        try {
            await userService.resetPassword(resetModal.userId, resetModal.newPassword);
            setMessage(`Contraseña actualizada para ${resetModal.username}`);
            setResetModal({ isOpen: false, userId: null, username: '', newPassword: '' });
        } catch (err) {
            setMessage('Error al cambiar contraseña');
        }
    };

    if (!isAdmin && message) {
        return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{message}</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Gestión de Usuarios</h1>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3>Crear Nuevo Usuario</h3>
                <form onSubmit={handleCreate} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Usuario (Email) *</label>
                            <input
                                className={`form-input${fieldErrors.username ? ' input-error' : ''}`}
                                value={newUser.username}
                                onChange={e => { setNewUser({ ...newUser, username: e.target.value }); clearError('username'); }}
                                placeholder="juan@email.com"
                            />
                            <FE field="username" />
                        </div>
                        <div className="form-group">
                            <label>Rol</label>
                            <select
                                className="form-input"
                                value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                            >
                                <option value="USER">Médico / Usuario</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Contraseña *</label>
                            <input
                                type="password"
                                className={`form-input${fieldErrors.password ? ' input-error' : ''}`}
                                value={newUser.password}
                                onChange={e => { setNewUser({ ...newUser, password: e.target.value }); clearError('password'); }}
                                placeholder="••••••"
                            />
                            <FE field="password" />
                        </div>
                        <div className="form-group">
                            <label>Confirmar Clave *</label>
                            <input
                                type="password"
                                className={`form-input${fieldErrors.confirmPassword ? ' input-error' : ''}`}
                                value={newUser.confirmPassword}
                                onChange={e => { setNewUser({ ...newUser, confirmPassword: e.target.value }); clearError('confirmPassword'); }}
                                placeholder="••••••"
                            />
                            <FE field="confirmPassword" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button type="submit" className="btn" style={{ minWidth: '150px' }}>
                            Crear Usuario
                        </button>
                    </div>
                </form>
                {message && <p style={{ marginTop: '1rem', color: message.includes('Error') ? 'red' : 'green' }}>{message}</p>}
            </div>

            <div className="glass-panel">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>Usuario</th>
                            <th style={{ padding: '1rem' }}>Rol</th>
                            <th style={{ padding: '1rem' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '1rem' }}>{u.id}</td>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{u.username}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '999px',
                                        fontSize: '0.8rem',
                                        background: u.role === 'ADMIN' ? '#dbeafe' : '#f0fdf4',
                                        color: u.role === 'ADMIN' ? '#1e40af' : '#166534'
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => openResetModal(u.id, u.username)}
                                        className="btn btn-secondary"
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                    >
                                        Clave
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.id, u.username)}
                                        className="btn"
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: '#ef4444' }}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Reset Password */}
            {resetModal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem', background: 'white' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Cambiar Clave: {resetModal.username}</h3>
                        <form onSubmit={handleResetSubmit}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Nueva Contraseña</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={resetModal.newPassword}
                                    onChange={e => setResetModal({ ...resetModal, newPassword: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setResetModal({ ...resetModal, isOpen: false })}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn">
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

