import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../../api/dashboardService';

const StatCard = ({ icon, label, value, valueColor, bg, iconBg }) => (
    <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: bg, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
        }}>
            <div style={{ color: iconBg }}>{icon}</div>
        </div>
        <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </p>
            <p style={{ margin: 0, fontSize: '1.9rem', fontWeight: 800, color: valueColor || 'var(--text-header)', lineHeight: 1 }}>
                {value}
            </p>
        </div>
    </div>
);

const QuickAction = ({ to, icon, title, description, accent }) => (
    <Link to={to} style={{ textDecoration: 'none' }}>
        <div className="glass-panel" style={{
            padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
            borderLeft: `4px solid ${accent}`,
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ color: accent }}>{icon}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-header)', fontSize: '0.95rem' }}>{title}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{description}</p>
        </div>
    </Link>
);

export default function DashboardHome() {
    const [stats, setStats] = useState({ totalPacientes: 0, consultasHoy: 0, ultimaConsulta: '-', pacienteUltimaConsulta: '-' });
    const [actividad, setActividad] = useState([]);

    useEffect(() => {
        dashboardService.getStats().then(r => setStats(r.data)).catch(console.error);
        dashboardService.getActividadSemana().then(r => setActividad(r.data)).catch(console.error);
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ marginBottom: '0.25rem' }}>Panel de Control</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Resumen de actividad del consultorio</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <StatCard
                    label="Pacientes Totales"
                    value={stats.totalPacientes}
                    valueColor="var(--primary-dark)"
                    bg="rgba(13,148,136,0.1)"
                    iconBg="var(--primary)"
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                />
                <StatCard
                    label="Consultas Hoy"
                    value={stats.consultasHoy}
                    valueColor={stats.consultasHoy > 0 ? 'var(--primary)' : 'var(--text-muted)'}
                    bg="rgba(99,102,241,0.1)"
                    iconBg="#6366f1"
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
                />
                <StatCard
                    label="Última Consulta"
                    value={stats.ultimaConsulta}
                    valueColor="var(--text-header)"
                    bg="rgba(245,158,11,0.1)"
                    iconBg="#f59e0b"
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                />
            </div>

            {/* Chart + Quick Actions row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', marginBottom: '2rem', alignItems: 'start' }}>
                {/* Activity Chart */}
                <div className="glass-panel" style={{ padding: '1.75rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Actividad — Últimos 7 días</h2>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Consultas registradas por día</p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={actividad} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradConsultas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.875rem' }}
                                labelStyle={{ fontWeight: 600 }}
                                formatter={(v) => [v, 'Consultas']}
                            />
                            <Area type="monotone" dataKey="consultas" stroke="#0d9488" strokeWidth={2.5} fill="url(#gradConsultas)" dot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h2 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 700 }}>Acciones Rápidas</h2>
                    <QuickAction
                        to="/pacientes/new"
                        accent="#0d9488"
                        title="Nuevo Paciente"
                        description="Registrar un nuevo paciente en el sistema"
                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
                    />
                    <QuickAction
                        to="/consultas/new"
                        accent="#6366f1"
                        title="Nueva Consulta"
                        description="Registrar una consulta médica"
                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
                    />
                    <QuickAction
                        to="/pacientes"
                        accent="#f59e0b"
                        title="Ver Pacientes"
                        description="Listado completo de pacientes activos"
                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
                    />
                </div>
            </div>

            {/* Last patient info */}
            {stats.pacienteUltimaConsulta !== '-' && (
                <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Último paciente atendido: <strong style={{ color: 'var(--text-header)' }}>{stats.pacienteUltimaConsulta}</strong>
                        <span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)' }}>· {stats.ultimaConsulta}</span>
                    </p>
                </div>
            )}
        </div>
    );
}
