import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pacienteService } from '../../api/pacienteService';
import { useFormValidation, rules } from '../../hooks/useFormValidation';
import FieldError from '../../components/common/FieldError';
import SectionHeader from '../../components/common/SectionHeader';
import TabButton from '../../components/common/TabButton';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';

export default function PatientFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [activeTab, setActiveTab] = useState('datos'); // 'datos' | 'familia' | 'psiquiatria'

    const [form, setForm] = useState({
        nombre: '', apellido: '', dni: '', email: '', telefono: '',
        fechaNacimiento: '', ciudad: '', direccion: '', sexo: '',
        ocupacion: '', estadoCivil: '', escolaridad: '',
        datosPadres: '', datosHijos: '', datosHermanos: ''
    });

    const [historyForm, setHistoryForm] = useState({
        antecedentesFamiliares: '', antecedentesPersonales: '', historiaConsumo: '',
        enfermedadActual: '', tratamientosPrevios: '', desarrolloPsicomotor: '',
        personalidadPrevia: '', antecedentesPsicologicos: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const pacienteRules = {
        nombre:   (v) => rules.requerido('El nombre')(v) || rules.minLength('El nombre', 2)(v),
        apellido: (v) => rules.requerido('El apellido')(v) || rules.minLength('El apellido', 2)(v),
        dni:      rules.dni(),
        email:    rules.email(),
        telefono: rules.telefono(),
    };

    const { errors: fieldErrors, validate, clearError } = useFormValidation(pacienteRules);

    useEffect(() => {
        if (isEdit) loadPatient();
    }, [isEdit]);

    const loadPatient = async () => {
        try {
            const response = await pacienteService.getById(id);
            setForm(response.data);
            if (response.data.historiaPsiquiatrica) {
                setHistoryForm(response.data.historiaPsiquiatrica);
            }
        } catch (err) {
            setError('No se pudo cargar el paciente.');
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleHistoryChange = (e) => setHistoryForm({ ...historyForm, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate(form)) return;
        setLoading(true); setError(''); setSuccessMsg('');

        try {
            let patientId = id;
            if (isEdit) {
                await pacienteService.update(id, form);
                setSuccessMsg('Datos personales actualizados exitosamente.');
            } else {
                const res = await pacienteService.create(form);
                patientId = res.data.id;
                const hasHistoryData = Object.values(historyForm).some(x => x !== '');
                if (hasHistoryData && patientId) {
                    await pacienteService.updateHistoriaPsiquiatrica(patientId, historyForm);
                }
                navigate('/pacientes');
            }
        } catch (err) {
            setError(err.response?.data?.details?.[0] || err.response?.data?.message || 'Error al guardar.');
        } finally {
            setLoading(false);
        }
    };

    const handleHistorySubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccessMsg('');

        try {
            await pacienteService.updateHistoriaPsiquiatrica(id, historyForm);
            setSuccessMsg('Historia psiquiátrica actualizada exitosamente.');
        } catch (err) {
            setError(err.response?.data?.details?.[0] || err.response?.data?.message || 'Error al guardar historia.');
        } finally {
            setLoading(false);
        }
    };

    const goToTab = (tabId) => { setActiveTab(tabId); setSuccessMsg(''); setError(''); };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <button 
                        onClick={() => navigate('/pacientes')}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, fontFamily: 'Figtree, sans-serif', fontSize: '0.9rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                        Volver a pacientes
                    </button>
                    <h1 style={{ marginBottom: '0.25rem' }}>{isEdit ? 'Ficha del Paciente' : 'Nuevo Paciente'}</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
                        {isEdit ? 'Actualice la información general y antecedentes médicos.' : 'Complete los datos obligatorios para dar de alta un nuevo registro.'}
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', padding: '0.35rem', background: 'var(--muted)', borderRadius: '99px', width: 'fit-content', border: '1px solid var(--border-subtle)' }}>
                <TabButton active={activeTab === 'datos'} onClick={() => goToTab('datos')} label="Datos Personales" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
                <TabButton active={activeTab === 'familia'} onClick={() => goToTab('familia')} label="Familiares" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
                <TabButton active={activeTab === 'psiquiatria'} onClick={() => goToTab('psiquiatria')} label="Antecedentes Médicos" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} />
            </div>

            <ErrorBanner message={error} />
            <SuccessBanner message={successMsg} />

            <div className="glass-panel" style={{ padding: '2.5rem', animation: 'fadeInUp 0.4s ease-out' }}>
                {activeTab === 'datos' && (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
                        
                        <div>
                            <SectionHeader title="Identidad" subtitle="Información básica del paciente" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Nombres *</label>
                                    <input className={`form-input${fieldErrors.nombre ? ' input-error' : ''}`} name="nombre" value={form.nombre} onChange={(e) => { handleChange(e); clearError('nombre'); }} placeholder="Ej. Juan Carlos" />
                                    <FieldError message={fieldErrors.nombre} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Apellidos *</label>
                                    <input className={`form-input${fieldErrors.apellido ? ' input-error' : ''}`} name="apellido" value={form.apellido} onChange={(e) => { handleChange(e); clearError('apellido'); }} placeholder="Ej. Pérez" />
                                    <FieldError message={fieldErrors.apellido} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>DNI *</label>
                                    <input className={`form-input${fieldErrors.dni ? ' input-error' : ''}`} name="dni" value={form.dni} onChange={(e) => { handleChange(e); clearError('dni'); }} placeholder="Sin puntos" />
                                    <FieldError message={fieldErrors.dni} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Fecha de Nacimiento</label>
                                    <input className="form-input" type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Sexo Biológico</label>
                                    <select className="form-input" name="sexo" value={form.sexo || ''} onChange={handleChange}>
                                        <option value="">Seleccione...</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <SectionHeader title="Contacto y Ubicación" subtitle="Medios para comunicarse con el paciente" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Teléfono Celular / Fijo</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
                                        <input className={`form-input${fieldErrors.telefono ? ' input-error' : ''}`} style={{ paddingLeft: '2.5rem' }} name="telefono" value={form.telefono} onChange={(e) => { handleChange(e); clearError('telefono'); }} placeholder="Código de área + número" />
                                    </div>
                                    <FieldError message={fieldErrors.telefono} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Correo Electrónico</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                                        <input className={`form-input${fieldErrors.email ? ' input-error' : ''}`} style={{ paddingLeft: '2.5rem' }} type="text" name="email" value={form.email} onChange={(e) => { handleChange(e); clearError('email'); }} placeholder="paciente@correo.com" />
                                    </div>
                                    <FieldError message={fieldErrors.email} />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Ciudad de Residencia</label>
                                    <input className="form-input" name="ciudad" value={form.ciudad || ''} onChange={handleChange} placeholder="Ej. Buenos Aires" />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Dirección Completa</label>
                                    <input className="form-input" name="direccion" value={form.direccion || ''} onChange={handleChange} placeholder="Calle, Número, Piso, Depto..." />
                                </div>
                            </div>
                        </div>

                        <div>
                            <SectionHeader title="Datos Sociodemográficos" subtitle="Información adicional del paciente" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Ocupación actual</label>
                                    <input className="form-input" name="ocupacion" value={form.ocupacion || ''} onChange={handleChange} placeholder="Ej. Arquitecto, Estudiante..." />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Estado Civil</label>
                                    <select className="form-input" name="estadoCivil" value={form.estadoCivil || ''} onChange={handleChange}>
                                        <option value="">Seleccione...</option>
                                        <option value="Soltero/a">Soltero/a</option>
                                        <option value="Casado/a">Casado/a</option>
                                        <option value="Divorciado/a">Divorciado/a</option>
                                        <option value="Viudo/a">Viudo/a</option>
                                        <option value="Union Libre">Unión Libre</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Nivel Educativo</label>
                                    <input className="form-input" name="escolaridad" value={form.escolaridad || ''} onChange={handleChange} placeholder="Ej. Universitario Incompleto" />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/pacientes')}>Cancelar</button>
                            <button type="submit" className="btn" disabled={loading}>
                                {loading ? 'Guardando...' : (isEdit ? 'Actualizar Información' : 'Registrar Paciente')}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'familia' && (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
                        <div style={{ padding: '1rem 1.5rem', background: 'var(--muted)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-header)' }}>
                                Indique el <strong>estado vital</strong> (vivo/fallecido, causas) y nombres de los familiares directos.
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Padres</label>
                            <textarea className="form-input" name="datosPadres" value={form.datosPadres || ''} onChange={handleChange} rows="3" placeholder="Ej: Padre fallecido a los 70 (causa cardíaca), Madre viva de 68 años (sana)." />
                        </div>
                        <div className="form-group">
                            <label>Hijos</label>
                            <textarea className="form-input" name="datosHijos" value={form.datosHijos || ''} onChange={handleChange} rows="3" placeholder="Ej: 2 hijos vivos (10 y 12 años)." />
                        </div>
                        <div className="form-group">
                            <label>Hermanos</label>
                            <textarea className="form-input" name="datosHermanos" value={form.datosHermanos || ''} onChange={handleChange} rows="3" placeholder="Ej: 1 hermano mayor (vivo, sano)." />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn" disabled={loading}>
                                {loading ? 'Guardando...' : 'Guardar Composición Familiar'}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'psiquiatria' && (
                    <form onSubmit={handleHistorySubmit} style={{ display: 'grid', gap: '2rem' }}>
                        
                        <div>
                            <SectionHeader title="Antecedentes Personales" subtitle="Historial médico y desarrollo del paciente" />
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Patológicos y No Patológicos</label>
                                    <textarea className="form-input" name="antecedentesPersonales" value={historyForm.antecedentesPersonales || ''} onChange={handleHistoryChange} rows="2" placeholder="Enfermedades crónicas, cirugías previas, alergias..." />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Desarrollo Psicomotor / Biografía</label>
                                    <textarea className="form-input" name="desarrolloPsicomotor" value={historyForm.desarrolloPsicomotor || ''} onChange={handleHistoryChange} rows="2" placeholder="Hitos del desarrollo, desempeño escolar, hitos vitales..." />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Personalidad Previa</label>
                                    <input className="form-input" name="personalidadPrevia" value={historyForm.personalidadPrevia || ''} onChange={handleHistoryChange} placeholder="Rasgos de personalidad antes del inicio de la enfermedad actual..." />
                                </div>
                            </div>
                        </div>

                        <div>
                            <SectionHeader title="Antecedentes Psiquiátricos y Familiares" subtitle="Historial de salud mental" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Antecedentes Familiares</label>
                                    <textarea className="form-input" name="antecedentesFamiliares" value={historyForm.antecedentesFamiliares || ''} onChange={handleHistoryChange} rows="3" placeholder="Diagnósticos psiquiátricos en familiares de 1er o 2do grado..." />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Antecedentes Psicológicos</label>
                                    <textarea className="form-input" name="antecedentesPsicologicos" value={historyForm.antecedentesPsicologicos || ''} onChange={handleHistoryChange} rows="3" placeholder="Terapias previas, traumas, eventos vitales estresantes..." />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Tratamientos Previos</label>
                                    <textarea className="form-input" name="tratamientosPrevios" value={historyForm.tratamientosPrevios || ''} onChange={handleHistoryChange} rows="3" placeholder="Medicación psicotrópica anterior, internaciones..." />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Hábitos Tóxicos / Consumo</label>
                                    <textarea className="form-input" name="historiaConsumo" value={historyForm.historiaConsumo || ''} onChange={handleHistoryChange} rows="3" placeholder="Consumo de alcohol, tabaco, sustancias psicoactivas..." />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn" disabled={loading}>
                                {loading ? 'Guardando...' : (isEdit ? 'Guardar Historia Médica' : 'Guardar Paciente e Historia')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
