import { useEffect, useState } from 'react';
import { userService } from '../../api/userService';
import { useFormValidation, rules } from '../../hooks/useFormValidation';
import { useConfirm } from '../../hooks/useConfirm';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import UserCreateForm from '../../components/admin/UserCreateForm';
import UsersTable from '../../components/admin/UsersTable';
import ResetPasswordModal from '../../components/admin/ResetPasswordModal';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', confirmPassword: '', role: 'USER', nombre: '', apellido: '', dni: '', matricula: '' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Reset Password Modal State
    const [resetModal, setResetModal] = useState({ isOpen: false, userId: null, username: '', newPassword: '' });
    const [resetError, setResetError] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    const userRules = {
        nombre:           rules.requerido('El nombre'),
        apellido:         rules.requerido('El apellido'),
        username:         rules.emailRequerido(),
        password:         rules.passwordMinLength(),
        confirmPassword:  rules.passwordMatch(),
    };
    const { errors: fieldErrors, validate, clearError } = useFormValidation(userRules);
    const confirm = useConfirm();

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
            setError("No tienes permisos para ver esta página.");
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(''); setSuccessMsg('');

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
            setSuccessMsg('Usuario creado exitosamente.');
            loadUsers();
        } catch (err) {
            setError(err.response?.data?.details?.[0] || err.response?.data?.message || 'Error al crear usuario. Intentá de nuevo.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id, username) => {
        if (await confirm(`¿Seguro que desea eliminar al usuario ${username}? Esta acción no se puede deshacer.`, { title: 'Eliminar usuario' })) {
            try {
                await userService.delete(id);
                setSuccessMsg('Usuario eliminado correctamente.');
                setError('');
                loadUsers();
            } catch (err) {
                setError('Error al eliminar usuario.');
            }
        }
    };

    const openResetModal = (id, username) => {
        setResetModal({ isOpen: true, userId: id, username, newPassword: '' });
        setResetError('');
    };

    const closeResetModal = () => {
        setResetModal({ isOpen: false, userId: null, username: '', newPassword: '' });
        setResetError('');
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (!resetModal.newPassword || isResetting) return;

        setIsResetting(true);
        try {
            await userService.resetPassword(resetModal.userId, resetModal.newPassword);
            setSuccessMsg(`Contraseña actualizada para ${resetModal.username}.`);
            setError('');
            closeResetModal();
        } catch (err) {
            setResetError('Error al cambiar la contraseña.');
        } finally {
            setIsResetting(false);
        }
    };

    if (!isAdmin && error) {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto' }} className="glass-panel text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="1.5" style={{ margin: '0 auto 1rem' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <h2 style={{ color: 'var(--destructive)', marginBottom: '0.5rem' }}>Acceso Denegado</h2>
                <p style={{ color: 'var(--text-muted)' }}>{error}</p>
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

            <ErrorBanner message={error} />
            <SuccessBanner message={successMsg} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <UserCreateForm
                    newUser={newUser}
                    setNewUser={setNewUser}
                    fieldErrors={fieldErrors}
                    clearError={clearError}
                    isCreating={isCreating}
                    onSubmit={handleCreate}
                />

                <UsersTable
                    users={users}
                    onResetPassword={openResetModal}
                    onDelete={handleDelete}
                />
            </div>

            <ResetPasswordModal
                isOpen={resetModal.isOpen}
                username={resetModal.username}
                newPassword={resetModal.newPassword}
                onPasswordChange={(e) => setResetModal({ ...resetModal, newPassword: e.target.value })}
                onSubmit={handleResetSubmit}
                onClose={closeResetModal}
                error={resetError}
                isSubmitting={isResetting}
            />
        </div>
    );
}
