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

    // Título de sección: la "etiqueta grande" que agrupa varios campos.
    // Deliberadamente más chico y liviano que el valor de un campo (abajo)
    // para que nunca compita con el dato real — solo ayuda a ubicarse.
    const Section = ({ title, children, color = 'var(--text-primary)' }) => (
        <div style={{ marginBottom: '1.75rem' }}>
            <h4 style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--primary)',
                margin: '0 0 0.65rem',
                paddingBottom: '0.35rem',
                borderBottom: '2px solid var(--primary-light, #dbeafe)'
            }}>
                {title}
            </h4>
            <div style={{ color: color }}>
                {children}
            </div>
        </div>
    );

    // Campo individual: la etiqueta va chica/tenue arriba, el VALOR es lo
    // que realmente importa leer, así que va más grande y con más contraste.
    const Field = ({ label, value }) => {
        if (!value) return null;
        return (
            <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.66rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.18rem' }}>
                    {label}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                    {value}
                </div>
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

    // "hace 3 días" — ayuda a ubicar rápido qué tan vieja es la visita que se está mirando.
    const formatRelative = (dateString) => {
        const diffMs = Date.now() - new Date(dateString).getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (days <= 0) return 'hoy';
        if (days === 1) return 'ayer';
        if (days < 30) return `hace ${days} días`;
        const months = Math.floor(days / 30);
        if (months < 12) return `hace ${months} mes${months > 1 ? 'es' : ''}`;
        const years = Math.floor(months / 12);
        return `hace ${years} año${years > 1 ? 's' : ''}`;
    };

    // Mismos umbrales que usa la vista de línea de tiempo, para que el color
    // de un riesgo signifique siempre lo mismo en toda la app.
    const riskColor = (value) => {
        if (['Alto', 'Inminente'].includes(value)) return { bg: '#FEE2E2', border: '#FCA5A5', text: '#991B1B' };
        if (value === 'Medio') return { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E' };
        if (value === 'Bajo' || value === 'Nulo') return { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534' };
        return null;
    };

    const RiskField = ({ label, value }) => {
        if (!value) return null;
        const c = riskColor(value);
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 500, fontSize: '0.8rem', letterSpacing: '0.02em', color: '#94a3b8' }}>{label}</span>
                <span style={{
                    fontSize: '0.8rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '999px',
                    background: c?.bg || '#f1f5f9', border: `1px solid ${c?.border || '#e2e8f0'}`, color: c?.text || 'var(--text-muted)'
                }}>{value}</span>
            </div>
        );
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        {formatDate(consultation.fechaConsulta)}
                    </div>
                    <span style={{
                        fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)',
                        background: '#fff', border: '1px solid var(--primary)', borderRadius: '999px', padding: '0.05rem 0.55rem'
                    }}>
                        {formatRelative(consultation.fechaConsulta)}
                    </span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                    {consultation.nombrePaciente} {consultation.apellidoPaciente}
                </div>
            </div>

            <Section title="Motivo de Consulta">
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{consultation.motivo}</p>
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

            {(consultation.evaluacionPsiquiatrica?.riesgoSuicida || consultation.evaluacionPsiquiatrica?.riesgoHomicida) && (
                <Section title="Riesgo">
                    <RiskField label="Riesgo Suicida" value={consultation.evaluacionPsiquiatrica?.riesgoSuicida} />
                    <RiskField label="Riesgo Homicida" value={consultation.evaluacionPsiquiatrica?.riesgoHomicida} />
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
                </div>
            </Section>

            <Section title="Diagnóstico">
                <Field label="Eje I" value={consultation.evaluacionPsiquiatrica?.eje1} />
                <Field label="Eje II" value={consultation.evaluacionPsiquiatrica?.eje2} />
                <Field label="Eje III" value={consultation.evaluacionPsiquiatrica?.eje3} />
                {consultation.diagnostico && (
                    <p style={{ marginTop: '0.5rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{consultation.diagnostico}</p>
                )}
            </Section>

            <Section title="Tratamiento">
                {consultation.tratamiento && (
                    <p style={{ whiteSpace: 'pre-line', margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{consultation.tratamiento}</p>
                )}
                <div style={{ marginTop: '0.5rem' }}>
                    <Field label="Adherencia" value={consultation.evaluacionPsiquiatrica?.adherenciaTratamiento} />
                    <Field label="Efectos Adversos" value={consultation.evaluacionPsiquiatrica?.efectosAdversos} />
                </div>
            </Section>

            {consultation.notas && (
                <Section title="Notas Adicionales">
                    <p style={{ whiteSpace: 'pre-line', margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{consultation.notas}</p>
                </Section>
            )}
        </div>
    );
};

export default ConsultationHistoryViewer;
