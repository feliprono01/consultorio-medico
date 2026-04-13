import { useState, useEffect } from 'react';
import { backupService } from '../../api/backupService';

export default function BackupPage() {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const response = await backupService.getAll();
            setBackups(response.data);
        } catch (error) {
            console.error('Error fetching backups:', error);
            setMessage({ type: 'error', text: 'Error al cargar backups.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        setCreating(true);
        setMessage(null);
        try {
            await backupService.create();
            setMessage({ type: 'success', text: 'Backup creado exitosamente.' });
            fetchBackups();
        } catch (error) {
            console.error('Error creating backup:', error);
            setMessage({ type: 'error', text: 'Error al crear backup.' });
        } finally {
            setCreating(false);
        }
    };

    const handleDownload = async (filename) => {
        try {
            const response = await backupService.download(filename);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading backup:', error);
            setMessage({ type: 'error', text: 'Error al descargar backup.' });
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Copias de Seguridad</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Gestión de respaldos de la base de datos</p>
                </div>
                <button
                    onClick={handleCreateBackup}
                    className="btn"
                    disabled={creating}
                    style={{ minWidth: '160px' }}
                >
                    {creating ? 'Creando...' : 'Crear Backup Nuevo'}
                </button>
            </div>

            {message && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    color: message.type === 'error' ? '#ef4444' : '#22c55e',
                    border: `1px solid ${message.type === 'error' ? '#ef4444' : '#22c55e'}`
                }}>
                    {message.text}
                </div>
            )}

            <div className="glass-panel" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>Archivo</th>
                            <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Cargando backups...
                                </td>
                            </tr>
                        )}
                        {!loading && backups.length === 0 && (
                            <tr>
                                <td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No hay backups disponibles.
                                </td>
                            </tr>
                        )}
                        {backups.map((backup) => (
                            <tr key={backup} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{backup}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleDownload(backup)}
                                        className="btn btn-secondary"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                    >
                                        Descargar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

