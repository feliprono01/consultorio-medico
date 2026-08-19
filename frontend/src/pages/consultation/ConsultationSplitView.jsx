import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { consultaService } from '../../api/consultaService';
import ConsultationFormPage from './ConsultationFormPage';
import ConsultationHistoryViewer from '../../components/consultation/ConsultationHistoryViewer';
import { useToast } from '../../hooks/useToast';

export default function ConsultationSplitView() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const pacienteIdFromQuery = searchParams.get('pacienteId');
    const navigate = useNavigate();
    const toast = useToast();

    // pacienteId resuelto: viene directo del query param al crear, o de la
    // consulta cargada al editar (se completa async en el efecto de abajo).
    const [resolvedPacienteId, setResolvedPacienteId] = useState(pacienteIdFromQuery);
    const [history, setHistory] = useState([]);
    const [selectedHistoryId, setSelectedHistoryId] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchHistory = useCallback(async (pid, cancelledRef) => {
        if (!pid) return;
        setLoadingHistory(true);
        try {
            const res = await consultaService.getByPaciente(pid);
            if (cancelledRef?.current) return;
            setHistory(res.data);
            // Seleccionar la última o la anterior a la actual si estamos editando
            if (res.data.length > 0) {
                // Si estamos editando (id presente), tratamos de no seleccionar la misma consulta
                // sino la anterior. Si es nueva, la última.
                const filtered = id ? res.data.filter(c => c.id !== parseInt(id)) : res.data;
                setSelectedHistoryId((filtered[0] || res.data[0]).id);
            }
        } catch (err) {
            if (!cancelledRef?.current) {
                console.error("Error loading history", err);
                toast.error('No se pudo cargar el historial de consultas.');
            }
        } finally {
            if (!cancelledRef?.current) setLoadingHistory(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        const cancelledRef = { current: false };

        if (pacienteIdFromQuery) {
            setResolvedPacienteId(pacienteIdFromQuery);
            fetchHistory(pacienteIdFromQuery, cancelledRef);
        } else if (id) {
            // Si es edición, primero obtenemos la consulta para saber el pacienteId
            consultaService.getById(id)
                .then(res => {
                    if (cancelledRef.current) return;
                    setResolvedPacienteId(res.data.pacienteId);
                    fetchHistory(res.data.pacienteId, cancelledRef);
                })
                .catch(err => {
                    if (!cancelledRef.current) {
                        console.error(err);
                        toast.error('No se pudo cargar la consulta.');
                    }
                });
        }

        return () => {
            cancelledRef.current = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, pacienteIdFromQuery]);

    /**
     * Se pasa como onSaved a ConsultationFormPage: en vez de navegar afuera
     * del split view (comportamiento anterior, que rompía la vista dividida),
     * refresca el panel de historial izquierdo. Si era una consulta nueva,
     * pasa a modo edición de esa misma consulta sin salir de la vista.
     */
    const handleSaved = (consulta) => {
        toast.success('Consulta guardada.');
        if (!id && consulta?.id) {
            navigate(`/consultas/edit/${consulta.id}`, { replace: true });
        } else if (resolvedPacienteId) {
            fetchHistory(resolvedPacienteId);
        }
    };

    const selectedConsultation = history.find(c => c.id === parseInt(selectedHistoryId));

    return (
        <div className="split-view-grid">

            {/* Left Panel: Historical View */}
            <div className="split-view-left" style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                {/* Header with Back Button */}
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', background: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/consultas" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', lineHeight: 1 }}>←</Link>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Consultorio</span>
                </div>
                {/* History Selector */}
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: 'white', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Historial (Referencia)
                    </label>
                    <select
                        className="form-input"
                        value={selectedHistoryId}
                        onChange={(e) => setSelectedHistoryId(e.target.value)}
                        style={{ fontSize: '0.9rem' }}
                    >
                        <option value="">Seleccione consulta...</option>
                        {history.map(c => (
                            <option key={c.id} value={c.id}>
                                {new Date(c.fechaConsulta).toLocaleDateString('es-AR')} - {c.motivo || 'Sin motivo'}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Content Viewer */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {loadingHistory ? (
                        <p>Cargando historial...</p>
                    ) : (
                        <ConsultationHistoryViewer consultation={selectedConsultation} />
                    )}
                </div>
            </div>

            {/* Right Panel: Active Form */}
            <div className="split-view-right" style={{ background: 'white', position: 'relative' }}>
                <div style={{ padding: '1rem', maxWidth: '100%' }}>
                    <ConsultationFormPage
                        pacienteId={resolvedPacienteId}
                        consultaId={id}
                        onSaved={handleSaved}
                        hideHistoryButton
                    />
                </div>
            </div>

        </div>
    );
}
