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
            setMessage({ type: 'error', text: 'Error al cargar los respaldos.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        setCreating(true);
        setMessage(null);
        try {
            await backupService.create();
            setMessage({ type: 'success', text: 'Backup cifrado creado exitosamente.' });
            fetchBackups();
        } catch (error) {
            console.error('Error creating backup:', error);
            setMessage({ type: 'error', text: 'Error al crear el backup. Intente nuevamente.' });
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
            setMessage({ type: 'error', text: 'Error al descargar el archivo de backup.' });
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Copias de Seguridad</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                        Gestión y descarga de respaldos cifrados de la base de datos
                    </p>
                </div>
                <button
                    onClick={handleCreateBackup}
                    className="btn"
                    disabled={creating}
                    style={{ minWidth: '200px', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}
                >
                    {creating ? (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                                <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"/>
                            </svg>
                            Procesando...
                        </>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                            Generar Backup
                        </>
                    )}
                </button>
            </div>

            {/* Panel de Información de Seguridad */}
            <div className="glass-panel" style={{ 
                marginBottom: '2rem', 
                padding: '1.25rem 1.5rem', 
                background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.05) 0%, rgba(255, 255, 255, 0.9) 100%)',
                borderLeft: '4px solid var(--primary)',
                display: 'flex', gap: '1rem', alignItems: 'flex-start'
            }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <div>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', color: 'var(--text-header)' }}>Backups Cifrados</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Todos los respaldos son comprimidos y encriptados en formato <code>.zip</code> con AES-256 para proteger la información médica de los pacientes. Los respaldos antiguos son eliminados automáticamente después de 30 días para liberar espacio.
                    </p>
                </div>
            </div>

            {message && (
                <div style={{
                    padding: '1rem 1.5rem',
                    marginBottom: '1.5rem',
                    borderRadius: '8px',
                    backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: message.type === 'error' ? 'var(--destructive)' : 'var(--accent)',
                    border: `1px solid ${message.type === 'error' ? '#FECACA' : '#A7F3D0'}`,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {message.type === 'success' ? (
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    ) : (
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    )}
                    {message.text}
                </div>
            )}

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Nombre del Archivo</th>
                            <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan="2" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" style={{ margin: '0 auto 0.5rem', display: 'block' }}>
                                        <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"/>
                                    </svg>
                                    <p style={{ margin: 0 }}>Cargando historial de respaldos...</p>
                                </td>
                            </tr>
                        )}
                        {!loading && backups.length === 0 && (
                            <tr>
                                <td colSpan="2" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" style={{ margin: '0 auto 1rem', display: 'block' }}>
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem', color: 'var(--text-header)' }}>No hay backups disponibles</p>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Generá un backup manual o esperá al próximo programado automático.</p>
                                </td>
                            </tr>
                        )}
                        {!loading && backups.map((backup) => {
                            const isZip = backup.endsWith('.zip');
                            return (
                                <tr key={backup} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {isZip ? (
                                                <div style={{ padding: '0.5rem', background: '#FEF3C7', color: '#D97706', borderRadius: '8px' }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12v6"/><path d="M14 12v6"/><path d="M10 12h4"/><path d="M10 15h4"/><path d="M10 18h4"/></svg>
                                                </div>
                                            ) : (
                                                <div style={{ padding: '0.5rem', background: '#F3F4F6', color: '#6B7280', borderRadius: '8px' }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                                </div>
                                            )}
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, fontFamily: 'Figtree, sans-serif', fontSize: '0.9rem', color: 'var(--text-header)' }}>
                                                    {backup}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {isZip ? 'Archivo ZIP Encriptado (AES-256)' : 'Archivo SQL Texto Plano'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDownload(backup)}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem', display: 'inline-flex' }}
                                            title="Descargar archivo"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                            Descargar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
