import { useEffect, useState } from 'react';
import { consultaService } from '../../api/consultaService';

export default function ConsultationHistoryModal({ consultaId, onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await consultaService.getHistorial(consultaId);
                setHistory(res.data);
            } catch (err) {
                console.error("Error fetching history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [consultaId]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '800px',
                maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Historial de Cambios</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {loading ? (
                    <p>Cargando historial...</p>
                ) : history.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No hay cambios registrados en esta consulta.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                <th style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>Fecha/Hora</th>
                                <th style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>Usuario</th>
                                <th style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>Campo</th>
                                <th style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>Valor Anterior</th>
                                <th style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>Valor Nuevo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.8rem' }}>{new Date(log.fechaCambio).toLocaleString('es-AR')}</td>
                                    <td style={{ padding: '0.8rem' }}>{log.modificadoPor}</td>
                                    <td style={{ padding: '0.8rem', fontWeight: 600 }}>{log.campo}</td>
                                    <td style={{ padding: '0.8rem', color: '#ef4444', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.valorAnterior}>{log.valorAnterior || '-'}</td>
                                    <td style={{ padding: '0.8rem', color: '#22c55e', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.valorNuevo}>{log.valorNuevo || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}
