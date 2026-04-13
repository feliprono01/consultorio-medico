import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { consultaService } from '../../api/consultaService';

export default function PatientEvolutionTab({ patientId }) {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (patientId) {
            loadHistory();
        }
    }, [patientId]);

    const loadHistory = async () => {
        try {
            const res = await consultaService.getByPaciente(patientId);
            // Sort by date ascending for the chart
            const sortedData = res.data.sort((a, b) => new Date(a.fechaConsulta) - new Date(b.fechaConsulta));
            setConsultas(sortedData);
        } catch (err) {
            console.error(err);
            setError('Error cargando el historial.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando evolución...</div>;
    if (error) return <div style={{ padding: '1rem', color: '#ef4444' }}>{error}</div>;
    if (consultas.length === 0) return <div style={{ padding: '2rem', color: '#64748b', textAlign: 'center' }}>No hay consultas registradas para mostrar evolución.</div>;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    };

    // Prepare data for charts
    const chartData = consultas.map(c => ({
        date: formatDate(c.fechaConsulta),
        fullDate: new Date(c.fechaConsulta).toLocaleDateString('es-AR'),
        estadoAnimo: c.estadoAnimo || null,
        calidadSueno: c.calidadSueno || null,
        alimentacion: c.alimentacion || null,
        sociabilidad: c.sociabilidad || null,
        funcionalidadLaboral: c.funcionalidadLaboral || null,
        funcionalidadSocial: c.funcionalidadSocial || null,
        funcionalidadFamiliar: c.funcionalidadFamiliar || null,
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#0f172a', fontSize: '1.1rem' }}>Evolución Clínica (Ánimo/Sueño/Dieta)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                                <YAxis domain={[0, 10]} stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#334155' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="estadoAnimo" name="Ánimo" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="calidadSueno" name="Sueño" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="alimentacion" name="Alimentación" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#0f172a', fontSize: '1.1rem' }}>Evolución Funcional (Laboral/Social/Familiar)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                                <YAxis domain={[0, 10]} stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#334155' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="funcionalidadLaboral" name="Laboral" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="funcionalidadSocial" name="Social" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey="funcionalidadFamiliar" name="Familiar" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Timeline Section */}
            <div>
                <h3 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Historial Cronológico</h3>
                <div style={{ position: 'relative', borderLeft: '2px solid #e2e8f0', marginLeft: '1rem', paddingLeft: '2rem' }}>
                    {[...consultas].reverse().map((consulta, index) => (
                        <div key={consulta.id} style={{ marginBottom: '2.5rem', position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '-2.55rem',
                                top: '0',
                                width: '1rem',
                                height: '1rem',
                                background: index === 0 ? '#0ea5e9' : 'white',
                                border: `2px solid ${index === 0 ? '#0ea5e9' : '#cbd5e1'}`,
                                borderRadius: '50%'
                            }}></div>

                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, color: '#334155', fontSize: '1.1rem' }}>
                                        {new Date(consulta.fechaConsulta).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </h4>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', padding: '0.2rem 0.8rem', borderRadius: '20px' }}>
                                        ID: {consulta.id}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                                    <div>
                                        {consulta.motivo && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Motivo</div>
                                                <div style={{ color: '#1e293b' }}>{consulta.motivo}</div>
                                            </div>
                                        )}
                                        {consulta.diagnostico && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Diagnóstico</div>
                                                <div style={{ color: '#1e293b' }}>{consulta.diagnostico}</div>
                                            </div>
                                        )}
                                        {consulta.tratamiento && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tratamiento</div>
                                                <div style={{ color: '#1e293b' }}>{consulta.tratamiento}</div>
                                            </div>
                                        )}
                                        {consulta.notas && (
                                            <div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Notas de Evolución</div>
                                                <div style={{ color: '#475569', fontStyle: 'italic', background: '#fffbeb', padding: '0.8rem', borderRadius: '6px' }}>{consulta.notas}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b' }}>Ánimo</span>
                                            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{consulta.estadoAnimo}/10</span>
                                        </div>
                                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b' }}>Sueño</span>
                                            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{consulta.calidadSueno}/10</span>
                                        </div>
                                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b' }}>Alimentación</span>
                                            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{consulta.alimentacion}/10</span>
                                        </div>
                                        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#64748b' }}>Sociabilidad</span>
                                            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{consulta.sociabilidad}/10</span>
                                        </div>
                                        <hr style={{ borderColor: '#e2e8f0', margin: '0.8rem 0' }} />
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                                            Funcionalidad Media: {((consulta.funcionalidadLaboral + consulta.funcionalidadSocial + consulta.funcionalidadFamiliar) / 3).toFixed(1)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
