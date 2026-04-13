import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ConsultationFormPage from './ConsultationFormPage';
import ConsultationHistoryViewer from '../components/consultation/ConsultationHistoryViewer';

export default function ConsultationSplitView() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const pacienteId = searchParams.get('pacienteId');

    // Si estamos editando, usamos el pacienteId de la consulta
    // Pero primero necesitamos cargar los datos si es edición o usar el param si es nueva

    const [history, setHistory] = useState([]);
    const [selectedHistoryId, setSelectedHistoryId] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Estado para "inyectar" en el form visualmente si fuese necesario o coordinar
    // En este MVP, ConsultationFormPage maneja su propio estado, y nosotros lo envolvemos.
    // Sin embargo, para que el Form sepa que está en modo "Split", podríamos pasar props
    // pero ConsultationFormPage actualmente no acepta muchas props de control.
    // Vamos a renderizar el ConsultationFormPage tal cual en la derecha.
    // Y el visor a la izquierda.

    const fetchHistory = async (pid) => {
        if (!pid) return;
        setLoadingHistory(true);
        try {
            const res = await api.get(`/consultas/paciente/${pid}`);
            setHistory(res.data);
            // Seleccionar la última o la anterior a la actual si estamos editando
            if (res.data.length > 0) {
                // Si estamos editando (id presente), tratamos de no seleccionar la misma consulta
                // sino la anterior. Si es nueva, la última.
                const filtered = id ? res.data.filter(c => c.id !== parseInt(id)) : res.data;
                if (filtered.length > 0) {
                    setSelectedHistoryId(filtered[0].id);
                } else if (res.data.length > 0) {
                    setSelectedHistoryId(res.data[0].id);
                }
            }
        } catch (err) {
            console.error("Error loading history", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (pacienteId) {
            fetchHistory(pacienteId);
        } else if (id) {
            // Si es edición, primero obtenemos la consulta para saber el pacienteId
            api.get(`/consultas/${id}`)
                .then(res => {
                    fetchHistory(res.data.pacienteId);
                })
                .catch(console.error);
        }
    }, [id, pacienteId]);

    const selectedConsultation = history.find(c => c.id === parseInt(selectedHistoryId));

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            height: '100%',
            gap: '1px',
            background: '#e2e8f0',
            overflow: 'hidden'
        }}>

            {/* Left Panel: Historical View */}
            <div style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
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
                                {new Date(c.fechaConsulta).toLocaleDateString()} - {c.motivo || 'Sin motivo'}
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
            <div style={{ background: 'white', height: '100%', overflowY: 'auto', position: 'relative' }}>
                <div style={{ padding: '1rem', maxWidth: '100%' }}>
                    {/* We wrap the page component. Note: Ideally we would refactor Page to be more component-like, 
                         but for now effectively rendering it works as long as routes/context are fine. */}
                    <ConsultationFormPage />
                </div>
            </div>

        </div>
    );
}
