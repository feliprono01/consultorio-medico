import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function EvolutionFormPage() {
    const navigate = useNavigate();

    // State for Patients
    const [pacientes, setPacientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Core Form State (Evolution focused)
    const [form, setForm] = useState({
        pacienteId: '',
        motivo: 'Evolución de tratamiento', // Default motif
        diagnostico: '', // Will be pre-filled
        tratamiento: '', // Will be pre-filled

        // Quantitative Fields
        estadoAnimo: 5,
        calidadSueno: 5,
        alimentacion: 5,
        sociabilidad: 5,
        funcionalidadLaboral: 5,
        funcionalidadSocial: 5,
        funcionalidadFamiliar: 5,

        // Notes
        notas: '',

        // Hidden/Default parts of full struct to satisfy backend if strict
        evaluacionPsiquiatrica: {}
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastConsult, setLastConsult] = useState(null);

    useEffect(() => {
        loadPacientes();
    }, []);

    const loadPacientes = async () => {
        try {
            const res = await api.get('/pacientes');
            setPacientes(res.data);
        } catch (err) {
            console.error("Error loading patients", err);
        }
    };

    const handleSelectPatient = async (patient) => {
        setForm(prev => ({ ...prev, pacienteId: patient.id }));
        setSearchTerm('');
        setIsSearching(false);
        setLoading(true);
        setError('');
        setLastConsult(null);

        try {
            const res = await api.get(`/consultas/paciente/${patient.id}/ultima`);
            if (res.data) {
                const last = res.data;
                setLastConsult(last);

                // Smart Carry-Over: Pre-fill diagnosis and existing treatment
                setForm(prev => ({
                    ...prev,
                    pacienteId: patient.id,
                    diagnostico: last.diagnostico || '',
                    tratamiento: last.tratamiento || '',
                    // Clone psychiatric eval structure if needed by backend, though simplified evolution implies we might not change axes every time.
                    // We'll keep them empty or carry over if backend requires them. 
                    // Let's carry over axes for consistency in records.
                    evaluacionPsiquiatrica: {
                        eje1: last.evaluacionPsiquiatrica?.eje1 || '',
                        eje2: last.evaluacionPsiquiatrica?.eje2 || '',
                        eje3: last.evaluacionPsiquiatrica?.eje3 || '',
                        adherenciaTratamiento: last.evaluacionPsiquiatrica?.adherenciaTratamiento || '',
                        efectosAdversos: last.evaluacionPsiquiatrica?.efectosAdversos || ''
                    }
                }));
            } else {
                // If no history found, strictly redirect to New Consultation
                const confirmNew = window.confirm(
                    `El paciente ${patient.nombre} ${patient.apellido} NO tiene consultas previas.\n\nDebe realizar una "Consulta Inicial" completa primero.`
                );
                if (confirmNew || true) {
                    navigate('/consultas/new?pacienteId=' + patient.id);
                }
            }
        } catch (err) {
            console.log("No previous consultation", err);
            // Treat error as no history for safety in this flow
            const confirmNew = window.confirm(
                `No se encontró historial para ${patient.nombre} ${patient.apellido}.\n\nSe redirigirá a "Consulta Inicial".`
            );
            if (confirmNew || true) {
                navigate('/consultas/new?pacienteId=' + patient.id);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: (['estadoAnimo', 'calidadSueno', 'alimentacion', 'sociabilidad', 'funcionalidadLaboral', 'funcionalidadSocial', 'funcionalidadFamiliar'].includes(name)) ? parseInt(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/consultas', form);
            navigate('/consultas');
        } catch (err) {
            console.error(err);
            setError('Error al guardar la evolución.');
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredPacientes = pacientes.filter(p =>
        `${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const selectedPatient = pacientes.find(p => p.id == form.pacienteId);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>Registrar Evolución</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                    Seguimiento rápido de tratamiento y estado clínico.
                </p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                {error && <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>{error}</div>}

                {/* PATIENT SEARCH */}
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label>Paciente</label>
                    {form.pacienteId && selectedPatient ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                            <div>
                                <span style={{ fontWeight: 600, color: '#15803d', display: 'block' }}>
                                    {selectedPatient.nombre} {selectedPatient.apellido}
                                </span>
                                <span style={{ fontSize: '0.9rem', color: '#166534' }}>DNI: {selectedPatient.dni}</span>
                            </div>
                            <button type="button" onClick={() => { setForm({ ...form, pacienteId: '' }); setLastConsult(null); setError(''); }} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>
                                Cambiar
                            </button>
                        </div>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <input
                                className="form-input"
                                placeholder="Buscar por nombre, apellido o DNI..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setIsSearching(true); }}
                                onFocus={() => setIsSearching(true)}
                            />
                            {isSearching && searchTerm && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', maxHeight: '250px', overflowY: 'auto', zIndex: 10, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                                    {filteredPacientes.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => handleSelectPatient(p)}
                                            style={{ padding: '0.8rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                        >
                                            <div style={{ fontWeight: 600 }}>{p.nombre} {p.apellido}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>DNI: {p.dni}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ONLY SHOW FORM IF PATIENT SELECTED AND HISTORY FOUND */}
                {form.pacienteId && lastConsult && (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>

                        {/* CONTEXT CARD */}
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#475569' }}>Contexto (Última Consulta)</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Diagnóstico Previo</label>
                                    <div style={{ fontWeight: 500, color: '#1e293b' }}>{lastConsult.diagnostico || 'Sin diagnóstico'}</div>
                                    {/* Invisibly store this in form, maybe allow edit if strictly needed, but concept is "Evolution" */}
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Tratamiento Activo</label>
                                    <textarea
                                        className="form-input"
                                        name="tratamiento"
                                        value={form.tratamiento}
                                        onChange={handleChange}
                                        rows="2"
                                        style={{ marginTop: '0.3rem', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* QUANTITATIVE SCALES */}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#1e293b' }}>Indicadores de Progreso (1-10)</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        Estado de Ánimo <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{form.estadoAnimo}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="estadoAnimo" value={form.estadoAnimo} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        Calidad de Sueño <span style={{ fontWeight: 700, color: '#ef4444' }}>{form.calidadSueno}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="calidadSueno" value={form.calidadSueno} onChange={handleChange} style={{ width: '100%', accentColor: '#ef4444' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        Alimentación <span style={{ fontWeight: 700, color: '#f59e0b' }}>{form.alimentacion}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="alimentacion" value={form.alimentacion} onChange={handleChange} style={{ width: '100%', accentColor: '#f59e0b' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        Sociabilidad <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{form.sociabilidad}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="sociabilidad" value={form.sociabilidad} onChange={handleChange} style={{ width: '100%', accentColor: '#8b5cf6' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', background: '#f0f9ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                                <div className="form-group">
                                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        Func. Laboral
                                        <span style={{ fontWeight: 700, color: '#0369a1' }}>{form.funcionalidadLaboral}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="funcionalidadLaboral" value={form.funcionalidadLaboral} onChange={handleChange} style={{ width: '100%', accentColor: '#0369a1' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        Func. Social
                                        <span style={{ fontWeight: 700, color: '#0369a1' }}>{form.funcionalidadSocial}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="funcionalidadSocial" value={form.funcionalidadSocial} onChange={handleChange} style={{ width: '100%', accentColor: '#0369a1' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        Func. Familiar
                                        <span style={{ fontWeight: 700, color: '#0369a1' }}>{form.funcionalidadFamiliar}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="funcionalidadFamiliar" value={form.funcionalidadFamiliar} onChange={handleChange} style={{ width: '100%', accentColor: '#0369a1' }} />
                                </div>
                            </div>
                        </div>

                        {/* EVOLUTION NOTES */}
                        <div className="form-group">
                            <label>Notas de Evolución (Avances, Cambios)</label>
                            <textarea
                                className="form-input"
                                name="notas"
                                value={form.notas}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Describa la evolución del paciente desde la última consulta..."
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn" disabled={loading} style={{ flex: 1 }}>
                                {loading ? 'Guardando...' : 'Registrar Evolución'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/consultas')}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
