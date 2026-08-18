import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pacienteService } from '../../api/pacienteService';
import { consultaService } from '../../api/consultaService';
import { useConfirm } from '../../hooks/useConfirm';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import Pagination from '../../components/common/Pagination';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PAGE_SIZE = 20;

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

export default function PatientListPage() {
    const [pacientes, setPacientes]   = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [page, setPage]             = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const navigate = useNavigate();
    const confirm = useConfirm();
    const debouncedSearch = useDebouncedValue(searchTerm, 300);

    const fetchPage = (pageToLoad) => {
        setLoading(true);
        pacienteService.getPage({ page: pageToLoad, size: PAGE_SIZE, q: debouncedSearch || undefined })
            .then(r => {
                setPacientes(r.data.content);
                setTotalPages(r.data.totalPages);
                setTotalElements(r.data.totalElements);
            })
            .catch(() => setError('Error al cargar pacientes.'))
            .finally(() => setLoading(false));
    };

    // Al cambiar la búsqueda, siempre se vuelve a la primera página.
    useEffect(() => {
        setPage(0);
        fetchPage(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    useEffect(() => {
        if (page === 0) return; // ya se pidió arriba al cambiar la búsqueda
        fetchPage(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleDelete = async (e, id) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (await confirm('¿Estás seguro de que quieres eliminar este paciente? Esta acción no se puede deshacer.', { title: 'Eliminar paciente' })) {
            try {
                await pacienteService.delete(id);
                // Si era el último de la página (y no es la primera), retrocede una página.
                if (pacientes.length === 1 && page > 0) {
                    setPage(page - 1);
                } else {
                    fetchPage(page);
                }
            } catch {
                alert('Hubo un error al eliminar el paciente.');
            }
        }
    };

    const generatePDF = async (patient) => {
        const pdfWindow = window.open('', '_blank');
        if (!pdfWindow) { alert('Por favor, permite las ventanas emergentes para ver el PDF.'); return; }
        pdfWindow.document.write('<html><body><h3>Generando Resumen Clínico...</h3><p>Por favor espere mientras se cargan los datos.</p></body></html>');
        try {
            const patientRes = await pacienteService.getById(patient.id);
            const fullPatient = patientRes.data;
            const history = fullPatient.historiaPsiquiatrica || {};
            const consultsRes = await consultaService.getByPaciente(patient.id);
            const consultations = consultsRes.data;
            const doc = new jsPDF();
            const generateTable = autoTable.default || autoTable;
            doc.setFillColor(8, 145, 178);
            doc.rect(0, 0, 210, 25, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.text('Resumen Clínico Integral', 105, 15, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Generado: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setTextColor(8, 145, 178);
            doc.text('1. Datos del Paciente', 14, 35);
            doc.line(14, 37, 196, 37);
            generateTable(doc, {
                startY: 40, head: [],
                body: [
                    ['Nombre Completo', `${fullPatient.nombre} ${fullPatient.apellido}`],
                    ['DNI', fullPatient.dni],
                    ['Edad', fullPatient.fechaNacimiento ? `${new Date().getFullYear() - new Date(fullPatient.fechaNacimiento).getFullYear()} años` : 'N/A'],
                    ['Teléfono', fullPatient.telefono || 'N/A'],
                    ['Email', fullPatient.email],
                ],
                theme: 'plain',
                styles: { cellPadding: 2, fontSize: 10 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
            });
            let finalY = (doc.lastAutoTable?.finalY || 40) + 10;
            doc.setFontSize(12); doc.setTextColor(8, 145, 178);
            doc.text('2. Historia Clínica (Antecedentes)', 14, finalY);
            doc.line(14, finalY + 2, 196, finalY + 2);
            generateTable(doc, {
                startY: finalY + 5,
                head: [['Antecedente', 'Descripción']],
                body: [
                    ['Antecedentes Heredofamiliares', history.antecedentesFamiliares || 'Sin registro'],
                    ['Antecedentes Personales', history.antecedentesPersonales || 'Sin registro'],
                    ['Historia de Consumo', history.historiaConsumo || 'Sin registro'],
                    ['Desarrollo Psicomotor', history.desarrolloPsicomotor || 'Sin registro'],
                    ['Personalidad Previa', history.personalidadPrevia || 'Sin registro'],
                    ['Tratamientos Previos', history.tratamientosPrevios || 'Sin registro'],
                    ['Enfermedad Actual', history.enfermedadActual || 'Sin registro'],
                ],
                theme: 'striped',
                headStyles: { fillColor: [100, 116, 139] },
                styles: { cellPadding: 4, overflow: 'linebreak' },
                columnStyles: { 0: { cellWidth: 60 } },
            });
            finalY = (doc.lastAutoTable?.finalY || finalY) + 10;
            if (finalY > 250) { doc.addPage(); finalY = 20; }
            doc.setFontSize(12); doc.setTextColor(8, 145, 178);
            doc.text('3. Historial de Consultas', 14, finalY);
            doc.line(14, finalY + 2, 196, finalY + 2);
            if (consultations.length > 0) {
                generateTable(doc, {
                    startY: finalY + 5,
                    head: [['Fecha', 'Motivo', 'Diagnóstico', 'Tratamiento', 'Riesgos']],
                    body: consultations.map(c => [
                        new Date(c.fechaConsulta).toLocaleDateString(),
                        c.motivo || '',
                        c.diagnostico || '',
                        c.tratamiento || '',
                        c.evaluacionPsiquiatrica ? `R.S: ${c.evaluacionPsiquiatrica.riesgoSuicida}\nR.H: ${c.evaluacionPsiquiatrica.riesgoHomicida}` : 'N/A',
                    ]),
                    theme: 'grid',
                    headStyles: { fillColor: [8, 145, 178] },
                    styles: { fontSize: 9, cellPadding: 3 },
                    columnStyles: { 0: { cellWidth: 25 }, 4: { cellWidth: 30 } },
                });
            } else {
                doc.setFontSize(10); doc.setTextColor(100);
                doc.text('No hay consultas registradas.', 14, finalY + 10);
            }
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150);
                doc.text(`Página ${i} de ${pageCount}`, 196, 290, { align: 'right' });
            }
            pdfWindow.location.href = URL.createObjectURL(doc.output('blob'));
        } catch (err) {
            if (pdfWindow) pdfWindow.document.body.innerHTML = `<h3 style="color:red">Error</h3><p>${err.message}</p>`;
            else alert('Error al generar el PDF: ' + err.message);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* ── shimmer keyframe ── */}
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Pacientes</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                        Gestión de historia clínica
                        {!loading && (
                            <span className="badge badge-primary" style={{ marginLeft: '0.75rem' }}>
                                {totalElements} registros
                            </span>
                        )}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <svg style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o DNI..."
                            className="form-input"
                            style={{ paddingLeft: '2.5rem', width: '260px' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link to="/pacientes/new" className="btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Nuevo Paciente
                    </Link>
                </div>
            </div>

            {/* ── Error ── */}
            {error && (
                <div style={{ background: 'var(--destructive-light)', color: 'var(--destructive)', padding: '1rem 1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', border: '1px solid #FECACA' }}>
                    {error}
                </div>
            )}

            {/* ── Table ── */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '1.5rem' }}>Paciente</th>
                            <th>DNI</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && [...Array(4)].map((_, i) => <SkeletonRow key={i} />)}

                        {!loading && pacientes.map(paciente => (
                            <tr key={paciente.id}>
                                {/* Name + Avatar */}
                                <td style={{ paddingLeft: '1.5rem', maxWidth: '220px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                        <Avatar nombre={paciente.nombre} apellido={paciente.apellido} />
                                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                            <p style={{ margin: 0, fontWeight: 700, fontFamily: 'Figtree, sans-serif', fontSize: '0.9rem', color: 'var(--text-header)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {paciente.nombre} {paciente.apellido}
                                            </p>
                                            {paciente.ciudad && (
                                                <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {paciente.ciudad}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="badge badge-muted">{paciente.dni}</span>
                                </td>
                                <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {paciente.email || '—'}
                                </td>
                                <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {paciente.telefono || '—'}
                                </td>
                                {/* Actions — icon-only with tooltips */}
                                <td style={{ paddingRight: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                                        <IconBtn onClick={() => generatePDF(paciente)} title="Descargar resumen PDF" color="#2563eb" bg="#EFF6FF" border="#BFDBFE">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                        </IconBtn>
                                        <IconBtn onClick={() => navigate(`/pacientes/evolucion/${paciente.id}`)} title="Ver evolución" color="#059669" bg="#F0FDF4" border="#BBF7D0">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                        </IconBtn>
                                        <IconBtn onClick={() => navigate(`/consultas?pacienteId=${paciente.id}`)} title="Ver historia clínica" color="var(--text-muted)" bg="var(--muted)" border="var(--border)">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                                        </IconBtn>
                                        <IconBtn onClick={() => navigate(`/pacientes/edit/${paciente.id}`)} title="Editar paciente" color="var(--primary)" bg="var(--primary-light)" border="var(--border)">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        </IconBtn>
                                        <IconBtn onClick={e => handleDelete(e, paciente.id)} title="Eliminar paciente" color="var(--destructive)" bg="var(--destructive-light)" border="#FECACA">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                        </IconBtn>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {!loading && pacientes.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                        </svg>
                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Figtree, sans-serif' }}>
                                            No se encontraron pacientes
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.8rem' }}>
                                            {searchTerm ? `No hay resultados para "${searchTerm}"` : 'Registrá el primer paciente para comenzar'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={setPage}
            />
        </div>
    );
}
