import { useState, useEffect } from 'react';
import { pacienteService } from '../../api/pacienteService';

export default function PsychiatricHistoryDetail({ patientId }) {
    const [form, setForm] = useState({
        antecedentesFamiliares: '',
        antecedentesPersonales: '',
        historiaConsumo: '',
        enfermedadActual: '',
        tratamientosPrevios: '',
        desarrolloPsicomotor: '',
        personalidadPrevia: ''
    });
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (patientId) {
            loadHistory();
        }
    }, [patientId]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            // Fetch patient which includes history nested
            const response = await pacienteService.getById(patientId);
            if (response.data.historiaPsiquiatrica) {
                setForm(response.data.historiaPsiquiatrica);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Error al cargar la historia psiquiátrica.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await pacienteService.updateHistoriaPsiquiatrica(patientId, form);
            setMessage({ type: 'success', text: 'Historia guardada correctamente.' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Error al guardar la historia.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <p>Cargando historia...</p>;

    return (
        <div style={{ paddingTop: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-header)' }}>Antecedentes Psiquiátricos</h2>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
                    color: message.type === 'error' ? '#ef4444' : '#16a34a',
                    border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                <div className="form-group">
                    <label>Enfermedad Actual (Motivo principal y evolución)</label>
                    <textarea
                        className="form-input"
                        name="enfermedadActual"
                        value={form.enfermedadActual || ''}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Descripción detallada del cuadro actual..."
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label>Antecedentes Heredofamiliares</label>
                        <textarea
                            className="form-input"
                            name="antecedentesFamiliares"
                            value={form.antecedentesFamiliares || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>Antecedentes Personales (Clínicos/Qx)</label>
                        <textarea
                            className="form-input"
                            name="antecedentesPersonales"
                            value={form.antecedentesPersonales || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Historia de Consumo (Sustancias)</label>
                    <textarea
                        className="form-input"
                        name="historiaConsumo"
                        value={form.historiaConsumo || ''}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Alcohol, tabaco, otras sustancias..."
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label>Tratamientos Psiquiátricos Previos</label>
                        <textarea
                            className="form-input"
                            name="tratamientosPrevios"
                            value={form.tratamientosPrevios || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>Personalidad Previa</label>
                        <textarea
                            className="form-input"
                            name="personalidadPrevia"
                            value={form.personalidadPrevia || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Desarrollo Psicomotor (Infancia/Adolescencia)</label>
                    <textarea
                        className="form-input"
                        name="desarrolloPsicomotor"
                        value={form.desarrolloPsicomotor || ''}
                        onChange={handleChange}
                        rows={2}
                    />
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn" disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar Historia'}
                    </button>
                </div>
            </form>
        </div>
    );
}
