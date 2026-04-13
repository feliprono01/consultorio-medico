import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PatientEvolutionChart({ consultations }) {
    if (!consultations || consultations.length < 2) {
        return (
            <div style={{
                padding: '1rem 1.5rem',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderLeft: '4px solid #3b82f6',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
                <p style={{ margin: 0, color: '#1e40af', fontSize: '0.9rem' }}>
                    Se necesitan al menos 2 consultas con datos de evolución para mostrar el gráfico.
                </p>
            </div>
        );
    }

    // 1. Prepare Data: Sort Ascending by Date
    const data = [...consultations]
        .sort((a, b) => new Date(a.fechaConsulta) - new Date(b.fechaConsulta))
        .map(c => ({
            date: new Date(c.fechaConsulta).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            fullDate: new Date(c.fechaConsulta).toLocaleDateString(),
            animo: c.estadoAnimo || null,
            sueno: c.calidadSueno || null,
            motivo: c.motivo
        }))
        .filter(item => item.animo !== null || item.sueno !== null);

    if (data.length === 0) {
        return (
            <div style={{
                padding: '1rem 1.5rem',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <p style={{ margin: 0, color: '#92400e', fontSize: '0.9rem' }}>
                    No hay datos cuantitativos (Ánimo/Sueño) registrados para generar la curva de evolución.
                </p>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', marginLeft: '1rem' }}>Evolución Cuantitativa</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '0.8rem' }} />
                        <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="#64748b" style={{ fontSize: '0.8rem' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#1e293b', fontWeight: 600, marginBottom: '0.25rem' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Line
                            type="monotone"
                            dataKey="animo"
                            name="Estado de Ánimo"
                            stroke="var(--primary)"
                            strokeWidth={3}
                            dot={{ fill: 'var(--primary)', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="sueno"
                            name="Calidad de Sueño"
                            stroke="var(--accent)"
                            strokeWidth={3}
                            dot={{ fill: 'var(--accent)', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
