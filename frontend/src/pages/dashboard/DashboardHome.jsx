import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../../api/dashboardService';
import { useToast } from '../../hooks/useToast';

/* ── Animated count-up hook ── */
function useCountUp(target, duration = 900) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!target || target === 0) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setValue(target); clearInterval(timer); }
            else setValue(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return value;
}

/* ── Stat Card ── */
const StatCard = ({ icon, label, value, displayValue, gradient, iconColor, delay = 0 }) => {
    const animated = useCountUp(typeof value === 'number' ? value : 0);
    return (
        <div className="glass-panel animate-fadeInUp" style={{ padding: '1.5rem', animationDelay: `${delay}ms` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                {/* Icon bubble */}
                <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: gradient, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: iconColor,
                    boxShadow: `0 4px 14px ${iconColor}30`,
                }}>
                    {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                        margin: '0 0 0.35rem 0', fontSize: '0.72rem', fontWeight: 700,
                        fontFamily: 'Figtree, sans-serif',
                        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em',
                    }}>
                        {label}
                    </p>
                    <p style={{
                        margin: 0, fontSize: '2rem', fontWeight: 800,
                        fontFamily: 'Figtree, sans-serif',
                        color: 'var(--text-header)', lineHeight: 1,
                    }}>
                        {displayValue ?? animated}
                    </p>
                </div>
            </div>
        </div>
    );
};

/* ── Quick Action Card ── */
const QuickAction = ({ to, icon, title, description, color }) => (
    <Link to={to} style={{ textDecoration: 'none' }}>
        <div
            className="glass-panel"
            style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(8,145,178,0.12)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
            }}
        >
            <div style={{
                width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                background: `${color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color,
            }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: '0 0 0.15rem', fontFamily: 'Figtree, sans-serif', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-header)' }}>{title}</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>{description}</p>
            </div>
            <svg style={{ marginLeft: 'auto', color: 'var(--border)', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
            </svg>
        </div>
    </Link>
);

/* ── Greeting ── */
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
}

export default function DashboardHome() {
    const [stats, setStats] = useState({ totalPacientes: 0, consultasHoy: 0, ultimaConsulta: '-', pacienteUltimaConsulta: '-' });
    const [actividad, setActividad] = useState([]);
    const [today] = useState(new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }));
    const toast = useToast();

    useEffect(() => {
        dashboardService.getStats().then(r => setStats(r.data)).catch((err) => {
            console.error(err);
            toast.error('No se pudieron cargar las estadísticas del panel.');
        });
        dashboardService.getActividadSemana().then(r => setActividad(r.data)).catch((err) => {
            console.error(err);
            toast.error('No se pudo cargar la actividad de la semana.');
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* ── Page Header ── */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, fontFamily: 'Figtree, sans-serif', textTransform: 'capitalize' }}>
                        {today}
                    </p>
                    <h1 style={{ marginBottom: '0.25rem' }}>{getGreeting()}</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                        Resumen de actividad del consultorio
                    </p>
                </div>
                <Link to="/consultas/new" style={{ textDecoration: 'none' }}>
                    <button className="btn" style={{ gap: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Nueva Consulta
                    </button>
                </Link>
            </div>

            {/* ── Stat Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard
                    delay={0}
                    label="Pacientes Totales"
                    value={stats.totalPacientes}
                    gradient="linear-gradient(135deg, rgba(8,145,178,0.12) 0%, rgba(34,211,238,0.12) 100%)"
                    iconColor="var(--primary)"
                    icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                />
                <StatCard
                    delay={80}
                    label="Consultas Hoy"
                    value={stats.consultasHoy}
                    gradient="linear-gradient(135deg, rgba(5,150,105,0.12) 0%, rgba(16,185,129,0.12) 100%)"
                    iconColor="var(--accent)"
                    icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
                />
                <StatCard
                    delay={160}
                    label="Última Consulta"
                    value={0}
                    displayValue={stats.ultimaConsulta !== '-' ? stats.ultimaConsulta.substring(0, 10) : '—'}
                    gradient="linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(251,191,36,0.12) 100%)"
                    iconColor="#f59e0b"
                    icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                />
            </div>

            {/* ── Chart + Quick Actions ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', marginBottom: '1.5rem', alignItems: 'start' }}>

                {/* Activity Chart */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1rem' }}>Actividad — Últimos 7 días</h2>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consultas registradas por día</p>
                        </div>
                        <span className="badge badge-primary">Esta semana</span>
                    </div>
                    <ResponsiveContainer width="100%" height={195}>
                        <AreaChart data={actividad} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradConsultas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#0891B2" stopOpacity={0.22} />
                                    <stop offset="95%" stopColor="#0891B2" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E0F7FA" />
                            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Noto Sans, sans-serif' }} axisLine={false} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Noto Sans, sans-serif' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.82rem', fontFamily: 'Noto Sans, sans-serif' }}
                                labelStyle={{ fontWeight: 600, fontFamily: 'Figtree, sans-serif' }}
                                formatter={(v) => [v, 'Consultas']}
                            />
                            <Area type="monotone" dataKey="consultas" stroke="#0891B2" strokeWidth={2.5} fill="url(#gradConsultas)" dot={{ r: 4, fill: '#0891B2', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#0891B2' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <h2 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontFamily: 'Figtree, sans-serif' }}>Acciones Rápidas</h2>
                    <QuickAction
                        to="/pacientes/new"
                        color="var(--primary)"
                        title="Nuevo Paciente"
                        description="Registrar un nuevo paciente"
                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
                    />
                    <QuickAction
                        to="/consultas/new"
                        color="var(--accent)"
                        title="Nueva Consulta"
                        description="Registrar una consulta médica"
                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
                    />
                    <QuickAction
                        to="/pacientes"
                        color="#f59e0b"
                        title="Ver Pacientes"
                        description="Listado de pacientes activos"
                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
                    />
                </div>
            </div>

            {/* ── Last Patient Banner ── */}
            {stats.pacienteUltimaConsulta !== '-' && (
                <div className="glass-panel animate-fadeInUp" style={{
                    padding: '1rem 1.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    background: 'linear-gradient(135deg, rgba(8,145,178,0.06) 0%, rgba(255,255,255,0.93) 100%)',
                    borderLeft: '3px solid var(--primary)',
                    animationDelay: '240ms',
                }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.8rem', fontWeight: 700,
                        fontFamily: 'Figtree, sans-serif', flexShrink: 0,
                    }}>
                        {stats.pacienteUltimaConsulta.charAt(0)}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Último paciente atendido:{' '}
                        <strong style={{ color: 'var(--text-header)', fontFamily: 'Figtree, sans-serif' }}>
                            {stats.pacienteUltimaConsulta}
                        </strong>
                        <span style={{ marginLeft: '0.75rem', color: 'var(--border)', marginRight: '0.5rem' }}>·</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{stats.ultimaConsulta}</span>
                    </p>
                </div>
            )}
        </div>
    );
}
