import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { pacienteService } from '../../api/pacienteService';
import { consultaService } from '../../api/consultaService';
import ConsultationHistoryModal from '../../components/consultation/ConsultationHistoryModal';
import { useFormValidation, rules } from '../../hooks/useFormValidation';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import FieldError from '../../components/common/FieldError';
import SectionHeader from '../../components/common/SectionHeader';
import TabButton from '../../components/common/TabButton';
import ErrorBanner from '../../components/common/ErrorBanner';
import PatientSearchSelect from '../../components/common/PatientSearchSelect';
import { MentalExamFields, RiskAssessmentFields } from '../../components/consultation/PsychiatricEvaluationFields';

/**
 * `pacienteId`/`consultaId`/`onSaved`/`hideHistoryButton` son opcionales —
 * si no se pasan, el componente sigue leyendo la URL directamente
 * (useParams/useSearchParams) y navegando tras guardar, igual que como
 * ruta directa (/consultas/new, /consultas/edit/:id). Un padre que lo
 * controle (ej. ConsultationSplitView) puede fijarlos para embeberlo sin
 * depender de la URL.
 */
export default function ConsultationFormPage({ pacienteId: pacienteIdProp, consultaId: consultaIdProp, onSaved, hideHistoryButton = false }) {
    const navigate = useNavigate();
    const { id: idFromParams } = useParams();
    const [searchParams] = useSearchParams();
    const id = consultaIdProp ?? idFromParams;
    const initialPacienteId = pacienteIdProp ?? searchParams.get('pacienteId');
    const isEdit = !!id;
    const toast = useToast();
    const confirm = useConfirm();

    const [pacientes, setPacientes] = useState([]);
    const [activeTab, setActiveTab] = useState('general');

    const [form, setForm] = useState({
        pacienteId: '', motivo: '', diagnostico: '', diagnosticoCie10: '', tratamiento: '', notas: '',
        estadoAnimo: 5, calidadSueno: 5, alimentacion: 5, sociabilidad: 5,
        funcionalidadLaboral: 5, funcionalidadSocial: 5, funcionalidadFamiliar: 5,
        medicaciones: [],
        evaluacionPsiquiatrica: {
            apariencia: '', conducta: '', lenguaje: '', animo: '', afecto: '',
            pensamiento: '', sensopercepcion: '', juicio: '', memoria: '',
            atencion: '', conciencia: '', orientacion: '', riesgoSuicida: '', riesgoHomicida: '',
            riesgoPropio: '', fundamentacionRiesgo: '', eje1: '', eje2: '', eje3: '',
            adherenciaTratamiento: '', efectosAdversos: ''
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    const consultaRules = {
        pacienteId: rules.requeridoSelect('un paciente'),
        motivo:     (v) => rules.requerido('El motivo')(v) || rules.minLength('El motivo', 5)(v),
    };
    const { errors: fieldErrors, validate, clearError } = useFormValidation(consultaRules);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const resPacientes = await pacienteService.getAll();
                setPacientes(resPacientes.data);

                if (isEdit) {
                    const resConsulta = await consultaService.getById(id);
                    const data = resConsulta.data;
                    setForm({
                        pacienteId: data.pacienteId,
                        motivo: data.motivo,
                        diagnostico: data.diagnostico || '',
                        diagnosticoCie10: data.diagnosticoCie10 || '',
                        tratamiento: data.tratamiento || '',
                        notas: data.notas || '',
                        estadoAnimo: data.estadoAnimo || 5,
                        calidadSueno: data.calidadSueno || 5,
                        alimentacion: data.alimentacion || 5,
                        sociabilidad: data.sociabilidad || 5,
                        funcionalidadLaboral: data.funcionalidadLaboral || 5,
                        funcionalidadSocial: data.funcionalidadSocial || 5,
                        funcionalidadFamiliar: data.funcionalidadFamiliar || 5,
                        medicaciones: data.medicaciones || [],
                        evaluacionPsiquiatrica: {
                            apariencia: '', conducta: '', lenguaje: '', animo: '', afecto: '',
                            pensamiento: '', sensopercepcion: '', juicio: '', memoria: '',
                            atencion: '', conciencia: '', orientacion: '', riesgoSuicida: '', riesgoHomicida: '',
                            riesgoPropio: '', fundamentacionRiesgo: '', eje1: '', eje2: '', eje3: '',
                            adherenciaTratamiento: '', efectosAdversos: '',
                            ...(data.evaluacionPsiquiatrica || {})
                        }
                    });
                } else if (initialPacienteId) {
                    setForm(prev => ({ ...prev, pacienteId: initialPacienteId }));
                    try {
                        await fetchLastConsultation(initialPacienteId);
                    } catch (ignore) {}
                }
            } catch (err) {
                setError('Error cargando la información.');
            }
        };
        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, id, initialPacienteId]);

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
        } catch (ignore) {}
    };

    const handleSelectPatient = async (patient) => {
        setForm(prev => ({ ...prev, pacienteId: patient.id }));
        setSearchTerm('');

        if (!isEdit) {
            try {
                const historyRes = await consultaService.getByPaciente(patient.id);
                if (historyRes.data && historyRes.data.length > 0) {
                    if (await confirm(`El paciente ${patient.nombre} ${patient.apellido} ya tiene una consulta inicial registrada.\n\nEl sistema derivará automáticamente a "Agregar Evolución" para continuar el tratamiento.`, { title: 'Consulta inicial ya registrada' })) {
                        navigate('/consultas/evolucion');
                    }
                    return;
                }
            } catch (err) {
                console.error(err);
                toast.error('No se pudo verificar si el paciente ya tiene una consulta inicial.');
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

    const handleAddMedicacion = () => {
        setForm({ ...form, medicaciones: [...(form.medicaciones || []), { farmaco: '', dosis: '', frecuencia: '', viaAdministracion: '', duracionPrevista: '' }] });
    };

    const handleMedicacionChange = (index, field, value) => {
        const nuevas = [...(form.medicaciones || [])];
        nuevas[index] = { ...nuevas[index], [field]: value };
        setForm({ ...form, medicaciones: nuevas });
    };

    const handleRemoveMedicacion = (index) => {
        setForm({ ...form, medicaciones: (form.medicaciones || []).filter((_, i) => i !== index) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate(form)) {
            if (!form.pacienteId || !form.motivo) setActiveTab('general');
            return;
        }
        setLoading(true); setError('');

        try {
            const res = isEdit
                ? await consultaService.corregir(id, form)
                : await consultaService.create(form);

            if (onSaved) {
                onSaved(res.data);
            } else {
                navigate('/consultas');
            }
        } catch (err) {
            setError(err.response?.data?.details?.[0] || err.response?.data?.message || 'Error al guardar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <button
                        onClick={() => navigate('/consultas')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, fontFamily: 'Figtree, sans-serif', fontSize: '0.9rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                        Volver a consultas
                    </button>
                    <h1 style={{ marginBottom: '0.25rem' }}>{isEdit ? 'Detalles de Consulta' : 'Nueva Consulta Inicial'}</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
                        {isEdit ? 'Ver y corregir detalles de la atención médica.' : 'Registrar primera atención para evaluación y diagnóstico de un paciente.'}
                    </p>
                </div>
                {isEdit && !hideHistoryButton && (
                    <button className="btn btn-secondary" onClick={() => setShowHistory(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Ver Historial
                    </button>
                )}
            </div>

            {showHistory && <ConsultationHistoryModal consultaId={id} onClose={() => setShowHistory(false)} />}

            {/* Navigation Tabs (Pill style) */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', padding: '0.35rem', background: 'var(--muted)', borderRadius: '99px', width: 'fit-content', border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
                <TabButton active={activeTab === 'general'} onClick={() => { setActiveTab('general'); setError(''); }} label="Generales" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>} />
                <TabButton active={activeTab === 'examen'} onClick={() => { setActiveTab('examen'); setError(''); }} label="Examen Mental" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>} />
                <TabButton active={activeTab === 'riesgos'} onClick={() => { setActiveTab('riesgos'); setError(''); }} label="Riesgos" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} />
                <TabButton active={activeTab === 'diagnostico'} onClick={() => { setActiveTab('diagnostico'); setError(''); }} label="Diagnóstico" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} />
                <TabButton active={activeTab === 'tratamiento'} onClick={() => { setActiveTab('tratamiento'); setError(''); }} label="Tratamiento" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.5 20.5l-6-6a4.5 4.5 0 1 1 6.5-6.5l6 6a4.5 4.5 0 1 1-6.5 6.5z"/><line x1="13.5" y1="6.5" x2="17.5" y2="10.5"/></svg>} />
            </div>

            <ErrorBanner message={error} />

            <div className="glass-panel" style={{ padding: '2.5rem', animation: 'fadeInUp 0.4s ease-out' }}>
                <form onSubmit={handleSubmit}>

                    {/* Tab: General */}
                    <div style={{ display: activeTab === 'general' ? 'grid' : 'none', gap: '2rem' }}>
                        <div>
                            <SectionHeader title="Datos del Paciente" subtitle="Seleccione el paciente y motivo de consulta principal." />
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Paciente *</label>
                                {form.pacienteId && selectedPatient ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--muted)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-darker))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                                                {selectedPatient.nombre.charAt(0)}{selectedPatient.apellido.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-header)', fontSize: '1.05rem' }}>{selectedPatient.nombre} {selectedPatient.apellido}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>DNI: {selectedPatient.dni}</div>
                                            </div>
                                        </div>
                                        {!isEdit && (
                                            <button type="button" onClick={handleClearPatient} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'underline' }}>
                                                Cambiar Paciente
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <PatientSearchSelect
                                        patients={filteredPacientes}
                                        searchTerm={searchTerm}
                                        onSearchTermChange={setSearchTerm}
                                        onSelect={handleSelectPatient}
                                        disabled={isEdit}
                                    />
                                )}
                                <FieldError message={fieldErrors.pacienteId} />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Motivo de Consulta *</label>
                                <textarea
                                    className={`form-input${fieldErrors.motivo ? ' input-error' : ''}`}
                                    name="motivo"
                                    value={form.motivo}
                                    onChange={(e) => { handleChange(e); clearError('motivo'); }}
                                    rows="2"
                                    placeholder="Describa el motivo principal..."
                                />
                                <FieldError message={fieldErrors.motivo} />
                            </div>
                        </div>

                        <div>
                            <SectionHeader title="Evaluación Basal" subtitle="Parámetros subjetivos de bienestar" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: 'var(--muted)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        Estado de Ánimo <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{form.estadoAnimo || 5}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="estadoAnimo" value={form.estadoAnimo || 5} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        <span>Pésimo (1)</span><span>Excelente (10)</span>
                                    </div>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        Calidad de Sueño <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{form.calidadSueno || 5}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="calidadSueno" value={form.calidadSueno || 5} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        <span>Insomnio (1)</span><span>Reparador (10)</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', background: 'var(--muted)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        Alimentación <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{form.alimentacion || 5}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="alimentacion" value={form.alimentacion || 5} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        <span>Mala</span><span>Excelente</span>
                                    </div>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        Sociabilidad <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{form.sociabilidad || 5}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="sociabilidad" value={form.sociabilidad || 5} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        <span>Aislamiento</span><span>Muy Social</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <SectionHeader title="Funcionalidad" subtitle="Impacto en áreas de la vida diaria (1-10)" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        Laboral / Escolar <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{form.funcionalidadLaboral || 5}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="funcionalidadLaboral" value={form.funcionalidadLaboral || 5} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--primary-dark)', cursor: 'pointer' }} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        Social <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{form.funcionalidadSocial || 5}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="funcionalidadSocial" value={form.funcionalidadSocial || 5} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--primary-dark)', cursor: 'pointer' }} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        Familiar <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{form.funcionalidadFamiliar || 5}</span>
                                    </label>
                                    <input type="range" min="1" max="10" name="funcionalidadFamiliar" value={form.funcionalidadFamiliar || 5} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--primary-dark)', cursor: 'pointer' }} />
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <SectionHeader title="Notas Libres" subtitle="Anotaciones generales de la consulta" />
                            <textarea className="form-input" name="notas" value={form.notas} onChange={handleChange} rows="3" placeholder="Comentarios adicionales..." />
                        </div>
                    </div>

                    {/* Tab: Examen Mental */}
                    <div style={{ display: activeTab === 'examen' ? 'grid' : 'none', gap: '1.5rem' }}>
                        <MentalExamFields values={form.evaluacionPsiquiatrica} onChange={handlePsychChange} />
                    </div>

                    {/* Tab: Riesgos */}
                    <div style={{ display: activeTab === 'riesgos' ? 'grid' : 'none', gap: '2rem' }}>
                        <RiskAssessmentFields values={form.evaluacionPsiquiatrica} onChange={handlePsychChange} />
                    </div>

                    {/* Tab: Diagnóstico */}
                    <div style={{ display: activeTab === 'diagnostico' ? 'grid' : 'none', gap: '2rem' }}>
                        <div>
                            <SectionHeader title="Ejes Diagnósticos" subtitle="Clasificación multiaxial" />
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Eje I: Trastornos Clínicos / Psiquiátricos</label>
                                    <input className="form-input" name="eje1" value={form.evaluacionPsiquiatrica?.eje1 || ''} onChange={handlePsychChange} placeholder="Ej. Depresión Mayor Recurrente" />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Eje II: Trastornos de Personalidad / Retraso Mental</label>
                                    <input className="form-input" name="eje2" value={form.evaluacionPsiquiatrica?.eje2 || ''} onChange={handlePsychChange} placeholder="Ej. Trastorno Límite de la Personalidad" />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Eje III: Enfermedades Médicas Generales</label>
                                    <input className="form-input" name="eje3" value={form.evaluacionPsiquiatrica?.eje3 || ''} onChange={handlePsychChange} placeholder="Ej. Hipotiroidismo, Hipertensión" />
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <SectionHeader title="Resumen" subtitle="Descripción general del diagnóstico" />
                            <textarea className="form-input" name="diagnostico" value={form.diagnostico} onChange={handleChange} rows="4" placeholder="Conclusión diagnóstica general..." />
                        </div>
                        <div className="form-group" style={{ margin: 0, maxWidth: '280px' }}>
                            <label>Código CIE-10</label>
                            <input className="form-input" name="diagnosticoCie10" value={form.diagnosticoCie10 || ''} onChange={handleChange} placeholder="Ej. F32.1" />
                        </div>
                    </div>

                    {/* Tab: Tratamiento */}
                    <div style={{ display: activeTab === 'tratamiento' ? 'grid' : 'none', gap: '2rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <SectionHeader title="Plan Terapéutico" subtitle="Indicaciones médicas y farmacológicas" />
                            <textarea className="form-input" name="tratamiento" value={form.tratamiento} onChange={handleChange} rows="5" placeholder="Detalle de medicación, posología, indicaciones psicoterapéuticas..." />
                        </div>

                        <div>
                            <SectionHeader title="Medicación" subtitle="Fármaco, dosis, frecuencia, vía y duración — complementa el texto de arriba" />
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {(form.medicaciones || []).map((med, i) => (
                                    <div key={i} style={{ display: 'grid', gap: '0.4rem', padding: '0.75rem', background: 'var(--muted)', borderRadius: 'var(--radius)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: '0.6rem', alignItems: 'center' }}>
                                            <input className="form-input" value={med.farmaco || ''} onChange={e => handleMedicacionChange(i, 'farmaco', e.target.value)} placeholder="Fármaco (ej. Sertralina)" aria-label={`Fármaco ${i + 1}`} />
                                            <input className="form-input" value={med.dosis || ''} onChange={e => handleMedicacionChange(i, 'dosis', e.target.value)} placeholder="Dosis (ej. 50mg)" aria-label={`Dosis ${i + 1}`} />
                                            <input className="form-input" value={med.frecuencia || ''} onChange={e => handleMedicacionChange(i, 'frecuencia', e.target.value)} placeholder="Frecuencia (ej. 1x/día)" aria-label={`Frecuencia ${i + 1}`} />
                                            <button type="button" onClick={() => handleRemoveMedicacion(i)} aria-label={`Quitar medicación ${i + 1}`} title="Quitar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--destructive)', padding: '0.4rem' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                            </button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                            <input className="form-input" value={med.viaAdministracion || ''} onChange={e => handleMedicacionChange(i, 'viaAdministracion', e.target.value)} placeholder="Vía (ej. Oral, Sublingual)" aria-label={`Vía de administración ${i + 1}`} />
                                            <input className="form-input" value={med.duracionPrevista || ''} onChange={e => handleMedicacionChange(i, 'duracionPrevista', e.target.value)} placeholder="Duración prevista (ej. 3 meses)" aria-label={`Duración prevista ${i + 1}`} />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-secondary" onClick={handleAddMedicacion} style={{ justifySelf: 'start' }}>
                                    + Agregar medicación
                                </button>
                            </div>
                        </div>

                        {!isEdit && (
                            <p style={{ margin: '-1rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                Campos opcionales — completalos solo si el paciente ya venía con un tratamiento indicado por otro profesional antes de esta primera consulta.
                            </p>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Adherencia al Tratamiento</label>
                                <select className="form-input" name="adherenciaTratamiento" value={form.evaluacionPsiquiatrica?.adherenciaTratamiento || ''} onChange={handlePsychChange}>
                                    <option value="">Seleccione nivel...</option>
                                    <option value="Buena">Buena</option>
                                    <option value="Regular">Regular (Olvidos ocasionales)</option>
                                    <option value="Mala">Mala (Abandono frecuente)</option>
                                    <option value="Nula">Nula (No toma medicación)</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Efectos Adversos Observados</label>
                                <input className="form-input" name="efectosAdversos" value={form.evaluacionPsiquiatrica?.efectosAdversos || ''} onChange={handlePsychChange} placeholder="Ej. Somnolencia, aumento de peso..." />
                            </div>
                        </div>
                    </div>

                    {isEdit && (
                        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 'var(--radius)', padding: '0.85rem 1.1rem', marginTop: '1rem', fontSize: '0.82rem', color: '#1E3A8A', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '0.1rem' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            <span>Esta consulta ya está guardada. Al confirmar se crea una <b>corrección</b> nueva — el registro original queda preservado tal cual se escribió, como exige la normativa de historia clínica.</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/consultas')}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn" disabled={loading}>
                            {loading ? 'Guardando...' : (isEdit ? 'Guardar Corrección' : 'Registrar Consulta')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
