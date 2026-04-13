import React from 'react';
import { Link } from 'react-router-dom';

export default function ConsultationTimeline({ consultations }) {
    if (!consultations || consultations.length === 0) return null;

    // Group consultations by Patient
    const grouped = consultations.reduce((acc, c) => {
        const pid = c.pacienteId;
        if (!acc[pid]) {
            acc[pid] = {
                id: pid,
                name: `${c.nombrePaciente} ${c.apellidoPaciente}`,
                dni: c.dniPaciente,
                items: []
            };
        }
        acc[pid].items.push(c);
        return acc;
    }, {});

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 0' }}>
            {Object.values(grouped).map((group) => (
                <div key={group.id} style={{ marginBottom: '3rem', background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {/* Patient Header */}
                    <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--text-header)', fontSize: '1.25rem' }}>{group.name}</h3>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>DNI: {group.dni}</span>
                        </div>
                        <Link to={`/pacientes/edit/${group.id}`} style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                            Ver Perfil →
                        </Link>
                    </div>

                    {/* Timeline for this patient */}
                    <div style={{ position: 'relative', paddingLeft: '20px' }}>
                        {/* Vertical Line */}
                        <div style={{
                            position: 'absolute',
                            left: '39px', // Center of the dot (20px padding + 19px offset)
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            background: '#e2e8f0',
                            zIndex: 0
                        }}></div>

                        {group.items.map((c, index) => {
                            // Determine Risk Color
                            let riskColor = '#10b981'; // Green
                            const psych = c.evaluacionPsiquiatrica;
                            if (psych) {
                                if (['Alto', 'Inminente'].includes(psych.riesgoSuicida) || ['Alto'].includes(psych.riesgoHomicida)) {
                                    riskColor = '#ef4444'; // Red
                                } else if (['Medio'].includes(psych.riesgoSuicida) || ['Medio'].includes(psych.riesgoHomicida)) {
                                    riskColor = '#f59e0b'; // Amber
                                }
                            }

                            return (
                                <div key={c.id} style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                                    {/* Timeline Dot */}
                                    <div style={{
                                        minWidth: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: riskColor,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        border: '4px solid white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        fontSize: '0.9rem'
                                    }}>
                                        {group.items.length - index}
                                    </div>

                                    {/* Content Card */}
                                    <div className="glass-panel" style={{ flex: 1, padding: '1.25rem 1.5rem', position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                     {new Date(c.fechaConsulta).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                                <h4 style={{ margin: '0.2rem 0', fontSize: '1.1rem', color: 'var(--primary-dark)' }}>{c.motivoConsulta}</h4>
                                            </div>
                                            <Link
                                                to={`/consultas/edit/${c.id}`}
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem', textDecoration: 'none', position: 'relative', zIndex: 10 }}>
                                                Ver Detalle
                                            </Link>
                                        </div>

                                        {/* Summary Content */}
                                        <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.95rem' }}>
                                            <div>
                                                <strong>Diagnóstico:</strong> <span style={{ color: 'var(--text-main)' }}>{c.diagnostico || '-'}</span>
                                            </div>

                                            {c.tratamiento && (
                                                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--accent)' }}>
                                                    <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>PLAN FARMACOLÓGICO</strong>
                                                    {c.tratamiento}
                                                </div>
                                            )}
                                        </div>

                                        {/* Evolution Badges */}
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                            {c.estadoAnimo && (
                                                <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                                                    Animo: {c.estadoAnimo}/10
                                                </span>
                                            )}
                                            {c.calidadSueno && (
                                                <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                                                    Sueño: {c.calidadSueno}/10
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
