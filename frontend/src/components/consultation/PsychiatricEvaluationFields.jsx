/**
 * Campos puramente presentacionales del examen mental y la evaluación de
 * riesgo, extraídos de ConsultationFormPage. Dependen solo de `values`
 * (form.evaluacionPsiquiatrica) y `onChange` (handlePsychChange) del padre.
 */

export function MentalExamFields({ values, onChange }) {
    return (
        <>
            <div style={{ padding: '1rem', background: 'var(--muted)', borderRadius: '12px', marginBottom: '0.5rem', border: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-header)' }}>Evaluación del estado mental actual del paciente.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}><label>Conciencia/Atención</label><input className="form-input" name="conciencia" value={values?.conciencia || ''} onChange={onChange} placeholder="Lúcido, distraído..." /></div>
                <div className="form-group" style={{ margin: 0 }}><label>Apariencia/Porte</label><input className="form-input" name="apariencia" value={values?.apariencia || ''} onChange={onChange} placeholder="Aseado, descuidado..." /></div>
                <div className="form-group" style={{ margin: 0 }}><label>Conducta/Actitud</label><input className="form-input" name="conducta" value={values?.conducta || ''} onChange={onChange} placeholder="Colaborador, hostil..." /></div>
                <div className="form-group" style={{ margin: 0 }}><label>Ánimo/Humor</label><input className="form-input" name="animo" value={values?.animo || ''} onChange={onChange} placeholder="Eutímico, deprimido..." /></div>
                <div className="form-group" style={{ margin: 0 }}><label>Afecto</label><input className="form-input" name="afecto" value={values?.afecto || ''} onChange={onChange} placeholder="Plano, embotado..." /></div>
                <div className="form-group" style={{ margin: 0 }}><label>Lenguaje</label><input className="form-input" name="lenguaje" value={values?.lenguaje || ''} onChange={onChange} placeholder="Coherente, verborrágico..." /></div>
                <div className="form-group" style={{ margin: 0 }}><label>Pensamiento</label><input className="form-input" name="pensamiento" value={values?.pensamiento || ''} onChange={onChange} placeholder="Curso y contenido..." /></div>
                <div className="form-group" style={{ margin: 0 }}><label>Senso-percepción</label><input className="form-input" name="sensopercepcion" value={values?.sensopercepcion || ''} onChange={onChange} placeholder="Sin alteraciones, alucinaciones..." /></div>
                <div className="form-group" style={{ margin: 0 }}><label>Juicio</label><input className="form-input" name="juicio" value={values?.juicio || ''} onChange={onChange} placeholder="Conservado, desviado..." /></div>
                <div className="form-group" style={{ margin: 0 }}><label>Memoria</label><input className="form-input" name="memoria" value={values?.memoria || ''} onChange={onChange} placeholder="Conservada, amnesia..." /></div>
            </div>
        </>
    );
}

export function RiskAssessmentFields({ values, onChange }) {
    return (
        <>
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '1.5rem', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05, transform: 'scale(3)' }}><svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                <h4 style={{ margin: '0 0 1rem 0', color: '#be123c', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Evaluación de Riesgo Vital
                </h4>
                <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ color: '#9f1239' }}>Riesgo Suicida</label>
                    <select className="form-input" name="riesgoSuicida" value={values?.riesgoSuicida || ''} onChange={onChange} style={{ borderColor: '#fecdd3', background: 'white' }}>
                        <option value="">Seleccione riesgo...</option>
                        <option value="Nulo">Nulo</option><option value="Bajo">Bajo</option><option value="Medio">Medio</option><option value="Alto">Alto</option><option value="Inminente">Inminente</option>
                    </select>
                </div>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1.5rem', borderRadius: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ color: '#b45309' }}>Riesgo Heteroagresivo (Hacia terceros)</label>
                    <select className="form-input" name="riesgoHomicida" value={values?.riesgoHomicida || ''} onChange={onChange} style={{ borderColor: '#fde68a', background: 'white' }}>
                        <option value="">Seleccione riesgo...</option>
                        <option value="Nulo">Nulo</option><option value="Bajo">Bajo</option><option value="Medio">Medio</option><option value="Alto">Alto</option>
                    </select>
                </div>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1.5rem', borderRadius: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ color: '#1d4ed8' }}>Riesgo Propio (Autocuidado / Negligencia)</label>
                    <select className="form-input" name="riesgoPropio" value={values?.riesgoPropio || ''} onChange={onChange} style={{ borderColor: '#bfdbfe', background: 'white' }}>
                        <option value="">Seleccione riesgo...</option>
                        <option value="Conservado">Conservado (Sin riesgo)</option><option value="Leve">Leve (Descuido ocasional)</option><option value="Moderado">Moderado</option><option value="Grave">Grave (Abandono total)</option>
                    </select>
                </div>
            </div>
        </>
    );
}
