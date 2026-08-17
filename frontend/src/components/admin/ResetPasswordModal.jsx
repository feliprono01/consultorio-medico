import Modal from '../common/Modal';
import ErrorBanner from '../common/ErrorBanner';

export default function ResetPasswordModal({ isOpen, username, newPassword, onPasswordChange, onSubmit, onClose, error }) {
    const header = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Forzar Cambio de Clave</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Usuario: {username}</p>
            </div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} header={header}>
            {/* El error se muestra DENTRO del modal — antes quedaba invisible detrás
                del overlay porque el banner global se ocultaba mientras el modal
                estaba abierto. */}
            <ErrorBanner message={error} />

            <form onSubmit={onSubmit}>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label>Nueva Contraseña</label>
                    <div style={{ position: 'relative' }}>
                        <svg style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                        <input
                            type="password"
                            className="form-input"
                            style={{ paddingLeft: '2.5rem' }}
                            value={newPassword}
                            onChange={onPasswordChange}
                            placeholder="Ingresa la nueva clave..."
                            required
                            autoFocus
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn" disabled={!newPassword}>
                        Actualizar Clave
                    </button>
                </div>
            </form>
        </Modal>
    );
}
