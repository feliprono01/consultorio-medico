import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { pacienteService } from '../../api/pacienteService';
import { consultaService } from '../../api/consultaService';
import ConsultationHistoryModal from '../../components/consultation/ConsultationHistoryModal';
import { useFormValidation, rules } from '../../hooks/useFormValidation';

export default function ConsultationFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const initialPacienteId = searchParams.get('pacienteId');
    const isEdit = !!id;

    const [pacientes, setPacientes] = useState([]);

    const [activeTab, setActiveTab] = useState('general');

    const [form, setForm] = useState({
        pacienteId: '',
        motivo: '',
        diagnostico: '',
        tratamiento: '',

        notas: '',
        estadoAnimo: 5,
        calidadSueno: 5,
        alimentacion: 5,
        sociabilidad: 5,
        funcionalidadLaboral: 5,
        funcionalidadSocial: 5,
        funcionalidadFamiliar: 5,
        evaluacionPsiquiatrica: {
            apariencia: '',
            conducta: '',
            lenguaje: '',
            animo: '',
            afecto: '',
            pensamiento: '',
            sensopercepcion: '',
            juicio: '',
            memoria: '',
            atencion: '',
            conciencia: '',
            riesgoSuicida: '',
            riesgoHomicida: '',
            riesgoPropio: '',
            eje1: '',
            eje2: '',
            eje3: '',
            adherenciaTratamiento: '',
            efectosAdversos: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const consultaRules = {
        pacienteId: rules.requeridoSelect('un paciente'),
        motivo:     (v) => rules.requerido('El motivo')(v) || rules.minLength('El motivo', 5)(v),
    };
    const { errors: fieldErrors, validate, clearError } = useFormValidation(consultaRules);
    const FieldError = ({ field }) => fieldErrors[field]
        ? <span style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors[field]}</span>
        : null;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 1. Cargar pacientes
                const resPacientes = await pacienteService.getAll();
                setPacientes(resPacientes.data);

                // 2. Si es edición, cargar consulta
                if (isEdit) {
                    const resConsulta = await consultaService.getById(id);
                    const data = resConsulta.data;
                    // Mapear campos que difieren ligeramente en DTO
                    setForm({
                        pacienteId: data.pacienteId,
                        motivo: data.motivo || data.motivoConsulta,
                        diagnostico: data.diagnostico || '',
                        tratamiento: data.tratamiento || '',
                        notas: data.notas || '',
                        estadoAnimo: data.estadoAnimo || 5,
                        calidadSueno: data.calidadSueno || 5,
                        alimentacion: data.alimentacion || 5,
                        sociabilidad: data.sociabilidad || 5,
                        funcionalidadLaboral: data.funcionalidadLaboral || 5,
                        funcionalidadSocial: data.funcionalidadSocial || 5,
                        funcionalidadFamiliar: data.funcionalidadFamiliar || 5,
                        evaluacionPsiquiatrica: {
                            apariencia: '', conducta: '', lenguaje: '', animo: '', afecto: '',
                            pensamiento: '', sensopercepcion: '', juicio: '', memoria: '',
                            atencion: '', conciencia: '', riesgoSuicida: '', riesgoHomicida: '',
                            riesgoPropio: '', eje1: '', eje2: '', eje3: '',
                            adherenciaTratamiento: '', efectosAdversos: '',
                            ...(data.evaluacionPsiquiatrica || {})
                        }
                    });
                } else if (initialPacienteId) {
                    setForm(prev => ({ ...prev, pacienteId: initialPacienteId }));
                    try {
                        await fetchLastConsultation(initialPacienteId);
                    } catch (ignore) { console.log("No previous consultation found."); }
                }
            } catch (err) {
                console.error("Error cargando datos", err);
                setError('Error cargando la información.');
            }
        };
        loadInitialData();
    }, [isEdit, id]);

    const fetchLastConsultation = async (pacienteId) => {
        try {
            const lastRes = await consultaService.getUltimaByPaciente(pacienteId);
            if (lastRes.data) {
                const last = lastRes.data;
                setForm(prev => ({
                    ...prev,
                    pacienteId: pacienteId,
                    diagnostico: last.diagnostico || '',
                    tratamiento: last.tratamiento || '',
                    evaluacionPsiquiatrica: {
                        ...prev.evaluacionPsiquiatrica,
                        eje1: last.evaluacionPsiquiatrica?.eje1 || '',
                        eje2: last.evaluacionPsiquiatrica?.eje2 || '',
                        eje3: last.evaluacionPsiquiatrica?.eje3 || '',
                        adherenciaTratamiento: last.evaluacionPsiquiatrica?.adherenciaTratamiento || '',
                        efectosAdversos: last.evaluacionPsiquiatrica?.efectosAdversos || ''
                    }
                }));
            }
        } catch (ignore) {
            console.log("No previous consultation found.");
        }
    };

    const handleSelectPatient = async (patient) => {
        setForm(prev => ({ ...prev, pacienteId: patient.id }));
        setSearchTerm('');
        setIsSearching(false);

        if (!isEdit) {
            // Check for existing history to enforce "One Initial Consultation" rule
            try {
                const historyRes = await consultaService.getByPaciente(patient.id);
                if (historyRes.data && historyRes.data.length > 0) {
                    // Patient has history -> Redirect to Evolution
                    const confirmEvolution = window.confirm(
                        `El paciente ${patient.nombre} ${patient.apellido} ya tiene una consulta inicial registrada.\n\nEl sistema derivará automáticamente a "Agregar Evolución" para continuar el tratamiento.`
                    );
                    if (confirmEvolution || true) { // Always redirect effectively
                        navigate('/consultas/evolucion');
                    }
                    return;
                }

                // If no history, it's a valid First Time consultation.
                // We don't need to fetchLastConsultation because there is none.
            } catch (err) {
                console.error("Error checking patient history", err);
            }
        }
    };

    const handleClearPatient = () => {
        setForm({ ...form, pacienteId: '' });
        setSearchTerm('');
    };

    const filteredPacientes = pacientes.filter(p =>
        `${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedPatient = pacientes.find(p => p.id == form.pacienteId);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: (['estadoAnimo', 'calidadSueno', 'alimentacion', 'sociabilidad', 'funcionalidadLaboral', 'funcionalidadSocial', 'funcionalidadFamiliar'].includes(name)) ? parseInt(value) : value
        });
    };

    const handlePsychChange = (e) => {
        setForm({
            ...form,
            evaluacionPsiquiatrica: {
                ...form.evaluacionPsiquiatrica,
                [e.target.name]: e.target.value
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate(form)) {
            // Si el error es de paciente, ir a la tab general
            if (!form.pacienteId || !form.motivo) setActiveTab('general');
            return;
        }
        setLoading(true);
        setError('');

        try {
            if (isEdit) {
                await consultaService.update(id, form);
            } else {
                await consultaService.create(form);
            }
            navigate('/consultas');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.details?.[0] || err.response?.data?.message || 'Error al guardar.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Helper para las pestañas
    const TabButton = ({ id, label, icon }) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            style={{
                padding: '0.8rem 1.2rem',
                background: activeTab === id ? 'var(--primary)' : 'transparent',
                color: activeTab === id ? 'white' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{ width: '100%' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>{isEdit ? 'Detalles de Consulta' : 'Nueva Consulta'}</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        {isEdit ? 'Ver y modificar detalles de la atención' : 'Registrar nueva atención médica'}
                    </p>
                </div>
                {isEdit && (
                    <button className="btn btn-secondary" onClick={() => setShowHistory(true)}>
                        <span style={{ marginRight: '0.5rem' }}>🕒</span> Ver Historial
                    </button>
                )}
            </div>

            {showHistory && <ConsultationHistoryModal consultaId={id} onClose={() => setShowHistory(false)} />}

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {error && <p style={{ color: 'var(--accent)', marginBottom: '1.5rem', fontWeight: 500 }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>

                    {/* Tabs Navigation */}
                    <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', overflowX: 'auto' }}>
                        <TabButton id="general" label="Gral" />
                        <TabButton id="examen" label="Ex. Mental" />
                        <TabButton id="riesgos" label="Riesgos" />
                        <TabButton id="diagnostico" label="Diagnóstico" />
                        <TabButton id="tratamiento" label="Tratamiento" />
                    </div>

                    {/* Tab: General */}
                    <div style={{ display: activeTab === 'general' ? 'grid' : 'none', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Paciente *</label>
                            {form.pacienteId && selectedPatient ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: 600, color: '#15803d' }}>
                                        {selectedPatient.nombre} {selectedPatient.apellido} <span style={{ fontWeight: 400, color: '#166534' }}>(DNI: {selectedPatient.dni})</span>
                                    </span>
                                    {!isEdit && (
                                        <button type="button" onClick={handleClearPatient} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            Cambiar
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="form-input"
                                        placeholder="Buscar por nombre, apellido o DNI..."
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setIsSearching(true); }}
                                        onFocus={() => setIsSearching(true)}
                                        // onBlur={() => setTimeout(() => setIsSearching(false), 200)} // Delay to allow click
                                        disabled={isEdit}
                                    />
                                    {isSearching && searchTerm && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', maxHeight: '250px', overflowY: 'auto', zIndex: 10, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                                            {filteredPacientes.length > 0 ? (
                                                filteredPacientes.map(p => (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => handleSelectPatient(p)}
                                                        style={{ padding: '0.8rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                                    >
                                                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{p.nombre} {p.apellido}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DNI: {p.dni}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>No se encontraron pacientes.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {fieldErrors.pacienteId && <FieldError field="pacienteId" />}

                        <div className="form-group">
                            <label>Motivo de Consulta *</label>
                            <input
                                className={`form-input${fieldErrors.motivo ? ' input-error' : ''}`}
                                name="motivo"
                                value={form.motivo}
                                onChange={(e) => { handleChange(e); clearError('motivo'); }}
                                placeholder="Ej. Ansiedad, Insomnio... (mín. 5 caracteres)"
                            />
                            <FieldError field="motivo" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div className="form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    Estado de Ánimo (1-10)
                                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}>{form.estadoAnimo || 5}</span>
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    name="estadoAnimo"
                                    value={form.estadoAnimo || 5}
                                    onChange={handleChange}
                                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <span>Pésimo (1)</span>
                                    <span>Excelente (10)</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    Calidad de Sueño (1-10)
                                    <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.2rem' }}>{form.calidadSueno || 5}</span>
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    name="calidadSueno"
                                    value={form.calidadSueno || 5}
                                    onChange={handleChange}
                                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <span>Insomnio (1)</span>
                                    <span>Reparador (10)</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div className="form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    Alimentación (1-10)
                                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}>{form.alimentacion || 5}</span>
                                </label>
                                <input type="range" min="1" max="10" name="alimentacion" value={form.alimentacion || 5} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <span>Mala</span>
                                    <span>Excelente</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    Sociabilidad (1-10)
                                    <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.2rem' }}>{form.sociabilidad || 5}</span>
                                </label>
                                <input type="range" min="1" max="10" name="sociabilidad" value={form.sociabilidad || 5} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <span>Aislamiento</span>
                                    <span>Muy Social</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', background: '#f0f9ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                            <div className="form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Func. Laboral
                                    <span style={{ fontWeight: 700, color: '#0369a1' }}>{form.funcionalidadLaboral || 5}</span>
                                </label>
                                <input type="range" min="1" max="10" name="funcionalidadLaboral" value={form.funcionalidadLaboral || 5} onChange={handleChange} style={{ width: '100%', accentColor: '#0369a1', cursor: 'pointer' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Func. Social
                                    <span style={{ fontWeight: 700, color: '#0369a1' }}>{form.funcionalidadSocial || 5}</span>
                                </label>
                                <input type="range" min="1" max="10" name="funcionalidadSocial" value={form.funcionalidadSocial || 5} onChange={handleChange} style={{ width: '100%', accentColor: '#0369a1', cursor: 'pointer' }} />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Func. Familiar
                                    <span style={{ fontWeight: 700, color: '#0369a1' }}>{form.funcionalidadFamiliar || 5}</span>
                                </label>
                                <input type="range" min="1" max="10" name="funcionalidadFamiliar" value={form.funcionalidadFamiliar || 5} onChange={handleChange} style={{ width: '100%', accentColor: '#0369a1', cursor: 'pointer' }} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Notas Adicionales</label>
                            <textarea className="form-input" name="notas" value={form.notas} onChange={handleChange} rows="4" />
                        </div>
                    </div>

                    {/* Tab: Examen Mental */}
                    <div style={{ display: activeTab === 'examen' ? 'grid' : 'none', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Conciencia/Atención</label>
                                <input className="form-input" name="conciencia" value={form.evaluacionPsiquiatrica?.conciencia || ''} onChange={handlePsychChange} placeholder="Lúcido, distraído..." />
                            </div>
                            <div className="form-group">
                                <label>Apariencia/Porte</label>
                                <input className="form-input" name="apariencia" value={form.evaluacionPsiquiatrica?.apariencia || ''} onChange={handlePsychChange} placeholder="Aseado, descuidado..." />
                            </div>
                            <div className="form-group">
                                <label>Conducta/Actitud</label>
                                <input className="form-input" name="conducta" value={form.evaluacionPsiquiatrica?.conducta || ''} onChange={handlePsychChange} placeholder="Colaborador, hostil..." />
                            </div>
                            <div className="form-group">
                                <label>Ánimo/Humor</label>
                                <input className="form-input" name="animo" value={form.evaluacionPsiquiatrica?.animo || ''} onChange={handlePsychChange} />
                            </div>
                            <div className="form-group">
                                <label>Afecto</label>
                                <input className="form-input" name="afecto" value={form.evaluacionPsiquiatrica?.afecto || ''} onChange={handlePsychChange} placeholder="Eutímico, plano..." />
                            </div>
                            <div className="form-group">
                                <label>Lenguaje</label>
                                <input className="form-input" name="lenguaje" value={form.evaluacionPsiquiatrica?.lenguaje || ''} onChange={handlePsychChange} />
                            </div>
                            <div className="form-group">
                                <label>Pensamiento</label>
                                <input className="form-input" name="pensamiento" value={form.evaluacionPsiquiatrica?.pensamiento || ''} onChange={handlePsychChange} placeholder="Curso y contenido..." />
                            </div>
                            <div className="form-group">
                                <label>Senso-percepción</label>
                                <input className="form-input" name="sensopercepcion" value={form.evaluacionPsiquiatrica?.sensopercepcion || ''} onChange={handlePsychChange} placeholder="Alucinaciones..." />
                            </div>
                            <div className="form-group">
                                <label>Juicio</label>
                                <input className="form-input" name="juicio" value={form.evaluacionPsiquiatrica?.juicio || ''} onChange={handlePsychChange} />
                            </div>
                            <div className="form-group">
                                <label>Memoria</label>
                                <input className="form-input" name="memoria" value={form.evaluacionPsiquiatrica?.memoria || ''} onChange={handlePsychChange} />
                            </div>
                        </div>
                    </div>

                    {/* Tab: Riesgos */}
                    <div style={{ display: activeTab === 'riesgos' ? 'grid' : 'none', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label style={{ color: '#ef4444', fontWeight: 600 }}>Riesgo Suicida</label>
                            <select
                                className="form-input"
                                name="riesgoSuicida"
                                value={form.evaluacionPsiquiatrica?.riesgoSuicida || ''}
                                onChange={handlePsychChange}
                                style={{ borderColor: '#fca5a5' }}
                            >
                                <option value="">Seleccione riesgo...</option>
                                <option value="Nulo">Nulo</option>
                                <option value="Bajo">Bajo</option>
                                <option value="Medio">Medio</option>
                                <option value="Alto">Alto</option>
                                <option value="Inminente">Inminente</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ color: '#f59e0b', fontWeight: 600 }}>Riesgo Heteroagresivo (Hacia terceros)</label>
                            <select
                                className="form-input"
                                name="riesgoHomicida"
                                value={form.evaluacionPsiquiatrica?.riesgoHomicida || ''}
                                onChange={handlePsychChange}
                                style={{ borderColor: '#fcd34d' }}
                            >
                                <option value="">Seleccione riesgo...</option>
                                <option value="Nulo">Nulo</option>
                                <option value="Bajo">Bajo</option>
                                <option value="Medio">Medio</option>
                                <option value="Alto">Alto</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{ color: '#3b82f6', fontWeight: 600 }}>Riesgo Propio (Autocuidado)</label>
                            <select
                                className="form-input"
                                name="riesgoPropio"
                                value={form.evaluacionPsiquiatrica?.riesgoPropio || ''}
                                onChange={handlePsychChange}
                                style={{ borderColor: '#93c5fd' }}
                            >
                                <option value="">Seleccione riesgo...</option>
                                <option value="Conservado">Conservado (Sin riesgo)</option>
                                <option value="Leve">Leve (Descuido ocasional)</option>
                                <option value="Moderado">Moderado</option>
                                <option value="Grave">Grave (Abandono total)</option>
                            </select>
                        </div>
                    </div>

                    {/* Tab: Diagnóstico */}
                    <div style={{ display: activeTab === 'diagnostico' ? 'grid' : 'none', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Eje I: Trastornos Clínicos</label>
                            <input className="form-input" name="eje1" value={form.evaluacionPsiquiatrica?.eje1 || ''} onChange={handlePsychChange} placeholder="Ej. Depresión Mayor Recurrente" />
                        </div>
                        <div className="form-group">
                            <label>Eje II: Trastornos de Personalidad / Retraso</label>
                            <input className="form-input" name="eje2" value={form.evaluacionPsiquiatrica?.eje2 || ''} onChange={handlePsychChange} placeholder="Ej. Trastorno Límite de la Personalidad" />
                        </div>
                        <div className="form-group">
                            <label>Eje III: Enfermedades Médicas</label>
                            <input className="form-input" name="eje3" value={form.evaluacionPsiquiatrica?.eje3 || ''} onChange={handlePsychChange} placeholder="Ej. Hipotiroidismo" />
                        </div>
                        <div className="form-group">
                            <label>Resumen Diagnóstico</label>
                            <textarea
                                className="form-input"
                                name="diagnostico"
                                value={form.diagnostico}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Resumen general del diagnóstico..."
                            />
                        </div>
                    </div>

                    {/* Tab: Tratamiento */}
                    <div style={{ display: activeTab === 'tratamiento' ? 'grid' : 'none', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label>Plan Farmacológico</label>
                            <textarea
                                className="form-input"
                                name="tratamiento"
                                value={form.tratamiento}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Detalle de medicación y dosis..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Adherencia al Tratamiento</label>
                            <select
                                className="form-input"
                                name="adherenciaTratamiento"
                                value={form.evaluacionPsiquiatrica?.adherenciaTratamiento || ''}
                                onChange={handlePsychChange}
                            >
                                <option value="">Seleccione...</option>
                                <option value="Buena">Buena</option>
                                <option value="Regular">Regular (Olvidos ocasionales)</option>
                                <option value="Mala">Mala (Abandono frecuente)</option>
                                <option value="Nula">Nula (No toma medicación)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Efectos Adversos / Secundarios</label>
                            <input className="form-input" name="efectosAdversos" value={form.evaluacionPsiquiatrica?.efectosAdversos || ''} onChange={handlePsychChange} placeholder="Ej. Aumento de peso, somnolencia..." />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Consulta'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/consultas')}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

