import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function DashboardHome() {
    const [stats, setStats] = useState({
        totalPacientes: 0,
        consultasHoy: 0,
        ultimaConsulta: '-',
        pacienteUltimaConsulta: '-'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>Panel de Control</h1>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Resumen de actividad del consultorio</p>
            </div>

            {/* Quick Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pacientes Totales</h3>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>{stats.totalPacientes}</p>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consultas Hoy</h3>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)' }}>{stats.consultasHoy}</p>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Última Consulta</h3>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>{stats.ultimaConsulta}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{stats.pacienteUltimaConsulta}</p>
                </div>
            </div>

            {/* Welcome / Quick Actions */}
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Bienvenido al Sistema</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px' }}>
                    Desde aquí puedes gestionar los pacientes, registrar nuevas consultas médicas y ver el historial clínico. Selecciona una acción rápida para comenzar:
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link to="/pacientes" className="btn">Ver Pacientes</Link>
                    <Link to="/pacientes/new" className="btn btn-secondary">Registrar Nuevo Paciente</Link>
                </div>
            </div>
        </div>
    );
}
