import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { consultaService } from '../../api/consultaService';
import { pacienteService } from '../../api/pacienteService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PatientEvolutionChart from '../../components/patient/PatientEvolutionChart';
import ConsultationTimeline from '../../components/consultation/ConsultationTimeline';

/* ── Avatar with initials ── */
const Avatar = ({ nombre, apellido }) => {
    const initials = `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase();
    const colors = [
        ['#0891B2', '#CFFAFE'], ['#059669', '#D1FAE5'],
        ['#7C3AED', '#EDE9FE'], ['#D97706', '#FEF3C7'],
        ['#DB2777', '#FCE7F3'],
    ];
    const idx = (nombre?.charCodeAt(0) ?? 0) % colors.length;
    const [bg, fg] = colors[idx];
    return (
        <div style={{
            width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${bg} 0%, ${fg} 100%)`,
            border: `2px solid ${bg}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: bg, fontSize: '0.78rem', fontWeight: 800,
            fontFamily: 'Figtree, sans-serif',
        }}>
            {initials}
        </div>
    );
};

/* ── Icon-only Button with tooltip ── */
const IconBtn = ({ onClick, title, color, bg, border, children }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        aria-label={title}
        style={{
            padding: '0.45rem 0.55rem',
            borderRadius: '8px',
            border: `1.5px solid ${border}`,
            background: bg,
            color,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
            flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.9)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
    >
        {children}
    </button>
);

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
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const filterPacienteId = searchParams.get('pacienteId');

    useEffect(() => {
        fetchConsultas();
    }, []);

    const fetchConsultas = async () => {
        try {
            const response = await consultaService.getAll();
            setConsultas(response.data);
        } catch (err) {
            console.error(err);
            setError('Error al cargar consultas.');
        } finally {
            setLoading(false);
        }
    };

    const filteredConsultas = consultas.filter(c => {
        if (filterPacienteId && c.pacienteId.toString() !== filterPacienteId) {
            return false;
        }
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        const nombreCompleto = `${c.nombrePaciente} ${c.apellidoPaciente} `.toLowerCase();
        return (
            nombreCompleto.includes(term) ||
            (c.dniPaciente && c.dniPaciente.toString().toLowerCase().includes(term)) ||
            ((c.motivo || c.motivoConsulta) && (c.motivo || c.motivoConsulta).toLowerCase().includes(term)) ||
            (c.diagnostico && c.diagnostico.toLowerCase().includes(term))
        );
    });

    const handleDelete = async (e, id) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (window.confirm('¿Seguro que desea eliminar esta consulta? Esta acción no se puede deshacer.')) {
            try {
                await consultaService.delete(id);
                setConsultas(prev => prev.filter(c => c.id !== id));
            } catch (err) {
                alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const generatePDF = async (c) => {
        const pdfWindow = window.open('', '_blank');
        if (!pdfWindow) { alert("Habilite las ventanas emergentes para ver el PDF."); return; }
        pdfWindow.document.write('<html><body><h3>Generando Informe...</h3><p>Por favor espere...</p></body></html>');
        try {
            const patientResponse = await pacienteService.getById(c.pacienteId);
            const paciente = patientResponse.data;
            const historia = paciente.historiaPsiquiatrica;
            const doc = new jsPDF();
            const generateTable = autoTable.default || autoTable;

            doc.setFillColor(8, 145, 178);
            doc.rect(0, 0, 210, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.text('Consultorio Médico - Informe de Atención', 105, 13, { align: 'center' });

            doc.setFontSize(12); doc.setTextColor(8, 145, 178);
            doc.text('Información del Paciente', 14, 30);
            doc.line(14, 32, 100, 32);

            doc.setFontSize(10); doc.setTextColor(0, 0, 0);
            doc.text(`Paciente: ${c.nombrePaciente} ${c.apellidoPaciente}`, 14, 40);
            doc.text(`DNI: ${c.dniPaciente}`, 14, 46);
            doc.text(`Fecha de Atención: ${new Date(c.fechaConsulta).toLocaleDateString()} ${new Date(c.fechaConsulta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 14, 52);

            doc.setFontSize(12); doc.setTextColor(8, 145, 178);
            doc.text('Detalles Clínicos', 14, 65);
            doc.line(14, 67, 100, 67);

            generateTable(doc, {
                startY: 75,
                head: [['Concepto', 'Descripción']],
                body: [
                    ['Motivo de Consulta', c.motivo || c.motivoConsulta || 'N/A'],
                    ['Diagnóstico', c.diagnostico || 'N/A'],
                    ['Tratamiento', c.tratamiento || 'N/A'],
                    ['Notas Adicionales', c.notas || 'N/A']
                ],
                theme: 'striped',
                headStyles: { fillColor: [8, 145, 178] },
                styles: { cellPadding: 5 }
            });

            if (historia) {
                let finalY = (doc.lastAutoTable?.finalY || 75) + 15;
                if (finalY > 250) { doc.addPage(); finalY = 20; }
                doc.setFontSize(12); doc.setTextColor(8, 145, 178);
                doc.text('Historia Psiquiátrica', 14, finalY);
                doc.line(14, finalY + 2, 100, finalY + 2);

                generateTable(doc, {
                    startY: finalY + 10,
                    head: [['Antecedente', 'Descripción']],
                    body: [
                        ['Antecedentes Familiares', historia.antecedentesFamiliares || 'N/A'],
                        ['Antecedentes Personales', historia.antecedentesPersonales || 'N/A'],
                        ['Historia de Consumo', historia.historiaConsumo || 'N/A'],
                        ['Enfermedad Actual', historia.enfermedadActual || 'N/A'],
                        ['Tratamientos Previos', historia.tratamientosPrevios || 'N/A'],
                        ['Desarrollo Psicomotor', historia.desarrolloPsicomotor || 'N/A'],
                        ['Personalidad Previa', historia.personalidadPrevia || 'N/A']
                    ],
                    theme: 'striped',
                    headStyles: { fillColor: [8, 145, 178] },
                    styles: { cellPadding: 5 }
                });
            }

            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8); doc.setTextColor(150);
                doc.text(`Generado automáticamente - Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
            }
            pdfWindow.location.href = URL.createObjectURL(doc.output('blob'));
        } catch (err) {
            if (pdfWindow) pdfWindow.document.body.innerHTML = `<h3 style="color:red">Error</h3><p>${err.message}</p>`;
            else alert("No se pudo generar el PDF.");
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
                        {!loading && <span className="badge badge-primary">{filteredConsultas.length} registros</span>}
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

            {error && (
                <div style={{ background: 'var(--destructive-light)', color: 'var(--destructive)', padding: '1rem 1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', border: '1px solid #FECACA' }}>
                    {error}
                </div>
            )}

            {filterPacienteId && !loading && (
                <PatientEvolutionChart consultations={filteredConsultas} />
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
                <ConsultationTimeline consultations={filteredConsultas} />
            ) : (
                <div className="glass-panel" style={{ overflow: 'hidden' }}>
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

                            {!loading && filteredConsultas.map(c => (
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
                                        {c.motivo || c.motivoConsulta || '—'}
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        {c.diagnostico || '—'}
                                    </td>
                                    <td style={{ paddingRight: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                                            <IconBtn onClick={() => generatePDF(c)} title="Descargar PDF" color="#2563eb" bg="#EFF6FF" border="#BFDBFE">
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
                            {!loading && filteredConsultas.length === 0 && (
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
            )}
        </div>
    );
}
