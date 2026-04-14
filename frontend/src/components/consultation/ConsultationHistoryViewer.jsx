import React from 'react';

const ConsultationHistoryViewer = ({ consultation }) => {
    if (!consultation) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                fontStyle: 'italic'
            }}>
                Seleccione una consulta histórica para ver los detalles
            </div>
        );
    }

    const Section = ({ title, children, color = 'var(--text-primary)' }) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: '0.5rem',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '0.25rem'
            }}>
                {title}
            </h4>
            <div style={{ color: color }}>
                {children}
            </div>
        </div>
    );

    const Field = ({ label, value }) => {
        if (!value) return null;
        return (
            <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{label}: </span>
                <span>{value}</span>
            </div>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={{ height: '100%', overflowY: 'auto', paddingRight: '0.5rem' }}>
            <div style={{
                background: '#f1f5f9',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                borderLeft: '4px solid var(--primary)'
            }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {formatDate(consultation.fechaConsulta)}
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                    {consultation.nombrePaciente} {consultation.apellidoPaciente}
                </div>
            </div>

            <Section title="Motivo de Consulta">
                <p>{consultation.motivo || consultation.motivoConsulta}</p>
            </Section>

            {(consultation.estadoAnimo || consultation.calidadSueno) && (
                <Section title="Métricas">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {consultation.estadoAnimo && (
                            <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ánimo</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    {consultation.estadoAnimo}/10
                                </div>
                            </div>
                        )}
                        {consultation.calidadSueno && (
                            <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sueño</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>
                                    {consultation.calidadSueno}/10
                                </div>
                            </div>
                        )}
                    </div>
                </Section>
            )}

            <Section title="Examen Mental">
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <Field label="Conciencia" value={consultation.evaluacionPsiquiatrica?.conciencia} />
                    <Field label="Apariencia" value={consultation.evaluacionPsiquiatrica?.apariencia} />
                    <Field label="Conducta" value={consultation.evaluacionPsiquiatrica?.conducta} />
                    <Field label="Ánimo" value={consultation.evaluacionPsiquiatrica?.animo} />
                    <Field label="Afecto" value={consultation.evaluacionPsiquiatrica?.afecto} />
                    <Field label="Pensamiento" value={consultation.evaluacionPsiquiatrica?.pensamiento} />
                    <Field label="Sensopercepción" value={consultation.evaluacionPsiquiatrica?.sensopercepcion} />
                    <Field label="Juicio" value={consultation.evaluacionPsiquiatrica?.juicio} />
                    <Field label="Memoria" value={consultation.evaluacionPsiquiatrica?.memoria} />
                    <Field label="Riesgo Suicida" value={consultation.evaluacionPsiquiatrica?.riesgoSuicida} />
                    <Field label="Riesgo Homicida" value={consultation.evaluacionPsiquiatrica?.riesgoHomicida} />
                </div>
            </Section>

            <Section title="Diagnóstico">
                <Field label="Eje I" value={consultation.evaluacionPsiquiatrica?.eje1} />
                <Field label="Eje II" value={consultation.evaluacionPsiquiatrica?.eje2} />
                <Field label="Eje III" value={consultation.evaluacionPsiquiatrica?.eje3} />
                <p style={{ marginTop: '0.5rem' }}>{consultation.diagnostico}</p>
            </Section>

            <Section title="Tratamiento">
                <p style={{ whiteSpace: 'pre-line' }}>{consultation.tratamiento}</p>
                <div style={{ marginTop: '0.5rem' }}>
                    <Field label="Adherencia" value={consultation.evaluacionPsiquiatrica?.adherenciaTratamiento} />
                    <Field label="Efectos Adversos" value={consultation.evaluacionPsiquiatrica?.efectosAdversos} />
                </div>
            </Section>

            {consultation.notas && (
                <Section title="Notas Adicionales">
                    <p style={{ whiteSpace: 'pre-line' }}>{consultation.notas}</p>
                </Section>
            )}
        </div>
    );
};

export default ConsultationHistoryViewer;
