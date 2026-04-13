import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pacienteService } from '../../api/pacienteService';

export default function PatientFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [activeTab, setActiveTab] = useState('datos'); // 'datos' | 'psiquiatria'

    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        fechaNacimiento: '',
        ciudad: '',
        direccion: '',
        sexo: '',
        ocupacion: '',
        estadoCivil: '',
        escolaridad: '',
        datosPadres: '',
        datosHijos: '',
        datosHermanos: ''
    });

    const [historyForm, setHistoryForm] = useState({
        antecedentesFamiliares: '',
        antecedentesPersonales: '',
        historiaConsumo: '',
        enfermedadActual: '',
        tratamientosPrevios: '',
        desarrolloPsicomotor: '',
        personalidadPrevia: '',
        antecedentesPsicologicos: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (isEdit) {
            loadPatient();
        }
    }, [isEdit]);

    const loadPatient = async () => {
        try {
            const response = await pacienteService.getById(id);
            setForm(response.data);
            if (response.data.historiaPsiquiatrica) {
                setHistoryForm(response.data.historiaPsiquiatrica);
            }
        } catch (err) {
            console.error(err);
            setError('No se pudo cargar el paciente.');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleHistoryChange = (e) => {
        setHistoryForm({ ...historyForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            let patientId = id;
            if (isEdit) {
                await pacienteService.update(id, form);
                setSuccessMsg('Datos personales actualizados.');
            } else {
                const res = await pacienteService.create(form);
                patientId = res.data.id;
                // Si hay datos en el formulario de historia, guardarlos inmediatamente
                const hasHistoryData = Object.values(historyForm).some(x => x !== '');
                if (hasHistoryData && patientId) {
                    await pacienteService.updateHistoriaPsiquiatrica(patientId, historyForm);
                }
                navigate('/pacientes');
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.details?.[0] || err.response?.data?.message || 'Error al guardar.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleHistorySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            await pacienteService.updateHistoriaPsiquiatrica(id, historyForm);
            setSuccessMsg('Historia psiquiátrica actualizada.');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.details?.[0] || err.response?.data?.message || 'Error al guardar historia.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const TabButton = ({ id, label }) => (
        <button
            type="button"
            onClick={() => { setActiveTab(id); setSuccessMsg(''); setError(''); }}
            style={{
                padding: '1rem 2rem',
                background: activeTab === id ? 'white' : 'transparent',
                border: 'none',
                borderBottom: activeTab === id ? '3px solid var(--primary)' : '3px solid transparent',
                fontWeight: activeTab === id ? 600 : 500,
                color: activeTab === id ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>{isEdit ? 'Editar Paciente' : 'Nuevo Paciente'}</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                    {isEdit ? 'Modifica los datos del paciente' : 'Completa el formulario para registrar un nuevo paciente'}
                </p>
            </div>

            {/* Mostrar pestañas siempre, pero deshabilitar Historia si es nuevo (opcional, pero mejor dejar accesible y guardar secuencia) */}
            <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                <TabButton id="datos" label="Datos Personales" />
                <TabButton id="familia" label="Datos Familiares" />
                <TabButton id="psiquiatria" label="Historia Clínica (Antecedentes)" />
            </div>

            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                {error && <div style={{ color: 'var(--accent)', marginBottom: '1rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>{error}</div>}
                {successMsg && <div style={{ color: 'var(--secondary)', marginBottom: '1rem', padding: '0.5rem', background: '#dcfce7', borderRadius: '4px' }}>{successMsg}</div>}

                {activeTab === 'datos' ? (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Nombre</label>
                                <input className="form-input" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Nombre" />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Apellido</label>
                                <input className="form-input" name="apellido" value={form.apellido} onChange={handleChange} required placeholder="Apellido" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Sexo</label>
                                <select className="form-input" name="sexo" value={form.sexo || ''} onChange={handleChange}>
                                    <option value="">Seleccione...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Ciudad</label>
                                <input className="form-input" name="ciudad" value={form.ciudad || ''} onChange={handleChange} placeholder="Ciudad" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Ocupación</label>
                                <input className="form-input" name="ocupacion" value={form.ocupacion || ''} onChange={handleChange} placeholder="Ej. Arquitecto" />
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
                                <label>Educación</label>
                                <input className="form-input" name="escolaridad" value={form.escolaridad || ''} onChange={handleChange} placeholder="Ej. Universitario" />
                            </div>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <label>Dirección</label>
                            <input className="form-input" name="direccion" value={form.direccion || ''} onChange={handleChange} placeholder="Calle, Número, Piso..." />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <label>DNI</label>
                            <input className="form-input" name="dni" value={form.dni} onChange={handleChange} required placeholder="12.345.678" />
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <label>Email</label>
                            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="ejemplo@email.com" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Teléfono</label>
                                <input className="form-input" name="telefono" value={form.telefono} onChange={handleChange} placeholder="555-1234" />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label>Fecha de Nacimiento</label>
                                <input
                                    className="form-input"
                                    type="date"
                                    name="fechaNacimiento"
                                    value={form.fechaNacimiento}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                            <button type="submit" className="btn" disabled={loading}>
                                {loading ? 'Guardando...' : (isEdit ? 'Actualizar Datos' : 'Crear Paciente')}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/pacientes')}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                ) : activeTab === 'familia' ? (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Indique si los familiares están vivos o fallecidos.
                            </p>
                        </div>
                        <div className="form-group">
                            <label>Padres (Estado vital y nombres)</label>
                            <textarea
                                className="form-input"
                                name="datosPadres"
                                value={form.datosPadres || ''}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Ej: Padre fallecido (causa), Madre viva..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Hijos (Estado vital y nombres)</label>
                            <textarea
                                className="form-input"
                                name="datosHijos"
                                value={form.datosHijos || ''}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Ej: 2 hijos vivos, 1 fallecido..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Hermanos (Estado vital y nombres)</label>
                            <textarea
                                className="form-input"
                                name="datosHermanos"
                                value={form.datosHermanos || ''}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Ej: 1 hermano vivo..."
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                            <button type="submit" className="btn" disabled={loading}>
                                {loading ? 'Guardando...' : 'Actualizar Datos Familiares'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleHistorySubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Complete los antecedentes psiquiátricos fundamentales para la historia clínica.
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Antecedentes Heredofamiliares</label>
                            <textarea
                                className="form-input"
                                name="antecedentesFamiliares"
                                value={historyForm.antecedentesFamiliares || ''}
                                onChange={handleHistoryChange}
                                rows="3"
                                placeholder="Antecedentes psiquiátricos en la familia..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Antecedentes Psicológicos</label>
                            <textarea
                                className="form-input"
                                name="antecedentesPsicologicos"
                                value={historyForm.antecedentesPsicologicos || ''}
                                onChange={handleHistoryChange}
                                rows="3"
                                placeholder="Antecedentes psicológicos relevantes..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Antecedentes Personales (Patológicos y No Patológicos)</label>
                            <textarea
                                className="form-input"
                                name="antecedentesPersonales"
                                value={historyForm.antecedentesPersonales || ''}
                                onChange={handleHistoryChange}
                                rows="3"
                                placeholder="Enfermedades médicas, cirugías, alergias..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Antecedentes Tóxicos / Historia de Consumo</label>
                            <textarea
                                className="form-input"
                                name="historiaConsumo"
                                value={historyForm.historiaConsumo || ''}
                                onChange={handleHistoryChange}
                                rows="3"
                                placeholder="Alcohol, tabaco, sustancias..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Desarrollo Psicomotor / Biografía</label>
                            <textarea
                                className="form-input"
                                name="desarrolloPsicomotor"
                                value={historyForm.desarrolloPsicomotor || ''}
                                onChange={handleHistoryChange}
                                rows="3"
                                placeholder="Hitos del desarrollo, escolaridad, trabajo..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Personalidad Previa</label>
                            <input
                                className="form-input"
                                name="personalidadPrevia"
                                value={historyForm.personalidadPrevia || ''}
                                onChange={handleHistoryChange}
                                placeholder="Rasgos de personalidad antes de la enfermedad..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Tratamientos Psiquiátricos Previos</label>
                            <textarea
                                className="form-input"
                                name="tratamientosPrevios"
                                value={historyForm.tratamientosPrevios || ''}
                                onChange={handleHistoryChange}
                                rows="2"
                                placeholder="Medicación anterior, hospitalizaciones..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                            <button type="submit" className="btn" disabled={loading}>
                                {loading ? 'Guardando...' : (isEdit ? 'Guardar Historia Clínica' : 'Guardar Paciente e Historia')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

