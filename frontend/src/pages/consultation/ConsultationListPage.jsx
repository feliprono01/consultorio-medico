import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { consultaService } from '../../api/consultaService';
import PatientEvolutionChart from '../../components/patient/PatientEvolutionChart';
import ConsultationTimeline from '../../components/consultation/ConsultationTimeline';
import Avatar from '../../components/common/Avatar';
import IconBtn from '../../components/common/IconBtn';
import ErrorBanner from '../../components/common/ErrorBanner';
import { generateConsultaPdf } from '../../utils/consultaPdf';
import { useConfirm } from '../../hooks/useConfirm';
import { useToast } from '../../hooks/useToast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import Pagination from '../../components/common/Pagination';

const PAGE_SIZE = 20;

/* ── Loading skeleton ── */
const SkeletonRow = () => (
    <tr>
        {[...Array(5)].map((_, i) => (
            <td key={i} style={{ padding: '1rem 1.5rem' }}>
                <div style={{ height: '16px', borderRadius: '6px', background: 'linear-gradient(90deg, #E0F7FA 25%, #B2EBF2 50%, #E0F7FA 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            </td>
        ))}
    </tr>
);

export default function ConsultationListPage() {
    const [consultas, setConsultas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'timeline'
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const confirm = useConfirm();
    const toast = useToast();
    const debouncedSearch = useDebouncedValue(searchTerm, 300);

    const filterPacienteId = searchParams.get('pacienteId');

    // Vista de historial de un paciente puntual (con gráfico de evolución):
    // trae todo su historial de una — está naturalmente acotado por paciente,
    // no necesita paginación, y no tiene sentido cortar el gráfico a una página.
    const fetchHistorialPaciente = async () => {
        setLoading(true);
        try {
            const response = await consultaService.getByPaciente(filterPacienteId);
            setConsultas(response.data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar consultas.');
        } finally {
            setLoading(false);
        }
    };

    // Vista general: pagina en el servidor. Con término de búsqueda, el
    // backend filtra por paciente/motivo/diagnóstico (motivo/diagnóstico
    // están cifrados, así que ese filtro corre en el backend sobre un bloque
    // acotado, no en SQL — mismo alcance que tenía el filtro del navegador).
    const fetchPage = async (pageToLoad) => {
        setLoading(true);
        try {
            const response = await consultaService.getAll({ page: pageToLoad, size: PAGE_SIZE, q: debouncedSearch || undefined });
            setConsultas(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            console.error(err);
            setError('Error al cargar consultas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (filterPacienteId) {
            fetchHistorialPaciente();
        } else {
            setPage(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterPacienteId, debouncedSearch]);

    // Se pide la página actual cada vez que cambia la página o el término de
    // búsqueda. Antes había un guard "if (page === 0) return" pensado para no
    // duplicar el pedido al resetear la búsqueda, pero eso también rompía
    // volver a la página 1 con "Anterior": el estado pasaba a 0 pero nunca se
    // volvían a pedir esos datos.
    useEffect(() => {
        if (filterPacienteId) return;
        fetchPage(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch]);

    // En la vista de historial de paciente, el término de búsqueda sigue
    // filtrando en el cliente (dataset chico, ya acotado a ese paciente).
    const displayedConsultas = filterPacienteId
        ? consultas.filter(c => {
            const term = searchTerm.toLowerCase();
            if (!term) return true;
            const nombreCompleto = `${c.nombrePaciente} ${c.apellidoPaciente} `.toLowerCase();
            return (
                nombreCompleto.includes(term) ||
                (c.dniPaciente && c.dniPaciente.toString().toLowerCase().includes(term)) ||
                (c.motivo && c.motivo.toLowerCase().includes(term)) ||
                (c.diagnostico && c.diagnostico.toLowerCase().includes(term))
            );
        })
        : consultas;

    const handleDelete = async (e, id) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (await confirm('¿Seguro que desea eliminar esta consulta? Esta acción no se puede deshacer.', { title: 'Eliminar consulta' })) {
            try {
                await consultaService.delete(id);
                if (filterPacienteId) {
                    setConsultas(prev => prev.filter(c => c.id !== id));
                } else if (consultas.length === 1 && page > 0) {
                    setPage(page - 1);
                } else {
                    fetchPage(page);
                }
            } catch (err) {
                toast.error('Error al eliminar: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'
            }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Consultas Médicas</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {filterPacienteId ? 'Historial de paciente específico' : 'Historial general de atenciones'}
                        {!loading && <span className="badge badge-primary">{filterPacienteId ? displayedConsultas.length : totalElements} registros</span>}
                    </p>
                    {filterPacienteId && (
                        <button
                            onClick={() => navigate('/consultas')}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, marginTop: '0.5rem', fontWeight: 600, fontFamily: 'Figtree, sans-serif' }}>
                            ← Ver todo el historial
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <svg style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar paciente, diagnóstico..."
                            className="form-input"
                            style={{ paddingLeft: '2.5rem', width: '260px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link to="/consultas/evolucion" className="btn btn-secondary" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', gap: '0.4rem' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        Evolución Rápida
                    </Link>
                    <Link to="/consultas/new" className="btn" style={{ gap: '0.4rem' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Nueva Consulta
                    </Link>
                </div>
            </div>

            <ErrorBanner message={error} />

            {filterPacienteId && !loading && (
                <PatientEvolutionChart consultations={displayedConsultas} />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Figtree, sans-serif' }}>VISTA:</span>
                <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '8px', padding: '0.2rem', border: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setViewMode('table')}
                        style={{
                            padding: '0.3rem 0.8rem', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Figtree, sans-serif',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                            background: viewMode === 'table' ? 'var(--primary-light)' : 'transparent',
                            color: viewMode === 'table' ? 'var(--primary-darker)' : 'var(--text-muted)'
                        }}>
                        Tabla
                    </button>
                    <button
                        onClick={() => setViewMode('timeline')}
                        style={{
                            padding: '0.3rem 0.8rem', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Figtree, sans-serif',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                            background: viewMode === 'timeline' ? 'var(--primary-light)' : 'transparent',
                            color: viewMode === 'timeline' ? 'var(--primary-darker)' : 'var(--text-muted)'
                        }}>
                        Línea de Tiempo
                    </button>
                </div>
            </div>

            {viewMode === 'timeline' ? (
                <ConsultationTimeline consultations={displayedConsultas} />
            ) : (
                <div className="glass-panel" style={{ overflow: 'hidden' }}>
                  <div className="table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '1.5rem' }}>Fecha</th>
                                <th>Paciente</th>
                                <th>Motivo</th>
                                <th>Diagnóstico</th>
                                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && [...Array(4)].map((_, i) => <SkeletonRow key={i} />)}

                            {!loading && displayedConsultas.map(c => (
                                <tr key={c.id}>
                                    <td style={{ paddingLeft: '1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--text-header)', fontFamily: 'Figtree, sans-serif' }}>
                                                {new Date(c.fechaConsulta).toLocaleDateString('es-AR')}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {new Date(c.fechaConsulta).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                            <Avatar nombre={c.nombrePaciente} apellido={c.apellidoPaciente} />
                                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                                <p style={{ margin: 0, fontWeight: 700, fontFamily: 'Figtree, sans-serif', fontSize: '0.9rem', color: 'var(--text-header)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {c.nombrePaciente} {c.apellidoPaciente}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    DNI: {c.dniPaciente}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        {c.motivo || '—'}
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        {c.diagnostico || '—'}
                                    </td>
                                    <td style={{ paddingRight: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                                            <IconBtn onClick={() => generateConsultaPdf(c)} title="Descargar PDF" color="#2563eb" bg="#EFF6FF" border="#BFDBFE">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                            </IconBtn>
                                            <IconBtn onClick={() => navigate(`/consultas/edit/${c.id}`)} title="Ver / Editar Consulta" color="var(--primary)" bg="var(--primary-light)" border="var(--border)">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                            </IconBtn>
                                            <IconBtn onClick={e => handleDelete(e, c.id)} title="Eliminar consulta" color="var(--destructive)" bg="var(--destructive-light)" border="#FECACA">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                            </IconBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && displayedConsultas.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                            </svg>
                                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Figtree, sans-serif' }}>
                                                No se encontraron consultas
                                            </p>
                                            <p style={{ margin: 0, fontSize: '0.8rem' }}>
                                                {searchTerm || filterPacienteId ? 'No hay resultados con estos filtros' : 'Registrá la primera consulta para comenzar'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                  </div>
                </div>
            )}

            {!filterPacienteId && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}
