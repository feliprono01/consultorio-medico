import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { consultaService } from '../../api/consultaService';
import { pacienteService } from '../../api/pacienteService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PatientEvolutionChart from '../../components/patient/PatientEvolutionChart';
import ConsultationTimeline from '../../components/consultation/ConsultationTimeline';

export default function ConsultationListPage() {
    const [consultas, setConsultas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'timeline'
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Check if we are filtering by specific patient via URL
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

    // Advanced Filtering Logic
    const filteredConsultas = consultas.filter(c => {
        // 1. Filter by Patient ID (if present in URL)
        if (filterPacienteId && c.pacienteId.toString() !== filterPacienteId) {
            return false;
        }

        // 2. Filter by Search Term (Name, DNI, Diagnosis, Reason)
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
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (window.confirm('¿Seguro que desea eliminar esta consulta? Esta acción no se puede deshacer.')) {
            try {
                console.log("Sending DELETE request...");
                await consultaService.delete(id);
                console.log("Delete successful");
                setConsultas(prev => prev.filter(c => c.id !== id));
                // Optional: success notification
            } catch (err) {
                console.error("Delete failed:", err);
                alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const generatePDF = async (c) => {
        // 1. Open window immediately
        const pdfWindow = window.open('', '_blank');
        if (!pdfWindow) {
            alert("Habilite las ventanas emergentes para ver el PDF.");
            return;
        }
        pdfWindow.document.write('Please wait, generating PDF...');

        try {
            // Fetch full patient data to get psychiatric history
            const patientResponse = await pacienteService.getById(c.pacienteId);
            const paciente = patientResponse.data;
            const historia = paciente.historiaPsiquiatrica;

            const doc = new jsPDF();

            // Header
            doc.setFillColor(37, 99, 235); // Blue color
            doc.rect(0, 0, 210, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.text('Consultorio Médico - Informe de Atención', 105, 13, { align: 'center' });

            // Reset Text
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);

            // Patient Info Section
            doc.setFontSize(12);
            doc.setTextColor(37, 99, 235);
            doc.text('Información del Paciente', 14, 30);
            doc.line(14, 32, 100, 32);

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Paciente: ${c.nombrePaciente} ${c.apellidoPaciente}`, 14, 40);
            doc.text(`DNI: ${c.dniPaciente}`, 14, 46);
            doc.text(`Fecha de Atención: ${new Date(c.fechaConsulta).toLocaleDateString()} ${new Date(c.fechaConsulta).toLocaleTimeString()}`, 14, 52);

            // Clinical Data Section
            doc.setFontSize(12);
            doc.setTextColor(37, 99, 235);
            doc.text('Detalles Clínicos', 14, 65);
            doc.line(14, 67, 100, 67);

            // Usamos autoTable pasando el doc explícitamente
            const generateTable = autoTable.default || autoTable;

            generateTable(doc, {
                startY: 75,
                head: [['Concepto', 'Descripción']],
                body: [
                    ['Motivo de Consulta', c.motivo || c.motivoConsulta],
                    ['Diagnóstico', c.diagnostico],
                    ['Tratamiento', c.tratamiento || 'N/A'],
                    ['Notas Adicionales', c.notas || 'N/A']
                ],
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235] },
                styles: { cellPadding: 5 }
            });

            // Psychiatric History Section (if available)
            if (historia) {
                let finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 75;
                finalY += 15;

                // Check if we need a new page
                if (finalY > 250) {
                    doc.addPage();
                    finalY = 20;
                }

                doc.setFontSize(12);
                doc.setTextColor(37, 99, 235);
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
                    headStyles: { fillColor: [37, 99, 235] },
                    styles: { cellPadding: 5 }
                });
            }

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0); // Reset color for footer
                doc.text('Generado automáticamente por Consultorio Médico App', 105, 290, { align: 'center' });
            }

            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);

            // Navigate window
            pdfWindow.location.href = url;

        } catch (err) {
            console.error("Error al generar PDF:", err);
            if (pdfWindow) pdfWindow.close();
            alert("No se pudo generar el PDF.");
        }
    };

    if (loading) return <p>Cargando...</p>;
    if (error) return <p style={{ color: 'var(--accent)' }}>{error}</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Consultas Médicas</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        {filterPacienteId
                            ? 'Mostrando historial de paciente específico'
                            : 'Historial general de atenciones'}
                    </p>
                    {filterPacienteId && (
                        <button
                            onClick={() => navigate('/consultas')}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, marginTop: '0.5rem', fontWeight: 500 }}>
                            ← Ver todo el historial
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Buscar paciente, diagnóstico..."
                        className="form-input"
                        style={{ padding: '0.6rem 1rem', width: '300px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Link to="/consultas/evolucion" className="btn btn-secondary" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                        + Agregar Evolución
                    </Link>
                    <Link to="/consultas/new" className="btn">
                        + Nueva Consulta
                    </Link>
                </div>
            </div>

            {/* Evolution Chart - Only visible when filtering by patient */}
            {filterPacienteId && !loading && (
                <PatientEvolutionChart consultations={filteredConsultas} />
            )}

            {/* View Toggle */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
                <span style={{ alignSelf: 'center', marginRight: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vista:</span>
                <button
                    onClick={() => setViewMode('table')}
                    className={viewMode === 'table' ? 'btn' : 'btn btn-secondary'}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                    Tabla
                </button>
                <button
                    onClick={() => setViewMode('timeline')}
                    className={viewMode === 'timeline' ? 'btn' : 'btn btn-secondary'}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                    Línea de Tiempo
                </button>
            </div>

            {viewMode === 'timeline' ? (
                <ConsultationTimeline consultations={filteredConsultas} />
            ) : (
                <div className="glass-panel" style={{ overflow: 'hidden' }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '2rem' }}>Fecha</th>
                                <th>Paciente</th>
                                <th>Motivo</th>
                                <th>Diagnóstico</th>
                                <th style={{ paddingRight: '2rem', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredConsultas.map(c => (
                                <tr key={c.id}>
                                    <td style={{ paddingLeft: '2rem', fontWeight: 500 }}>
                                        {new Date(c.fechaConsulta).toLocaleDateString('es-AR')} {new Date(c.fechaConsulta).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--text-header)' }}>
                                            {c.nombrePaciente} {c.apellidoPaciente}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            DNI: {c.dniPaciente}
                                        </div>
                                    </td>
                                    <td>{c.motivo || c.motivoConsulta}</td>
                                    <td>{c.diagnostico}</td>
                                    <td style={{ paddingRight: '2rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => generatePDF(c)}
                                                className="btn btn-secondary"
                                                style={{
                                                    padding: '0.4rem 1rem',
                                                    fontSize: '0.8rem',
                                                    borderRadius: '8px',
                                                    background: '#eff6ff',
                                                    color: '#2563eb',
                                                    border: '1px solid #bfdbfe'
                                                }}>
                                                PDF
                                            </button>
                                            <Link
                                                to={`/consultas/edit/${c.id}`}
                                                className="btn btn-secondary"
                                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
                                                Ver Detalles
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDelete(e, c.id)}
                                                className="btn btn-secondary"
                                                style={{
                                                    padding: '0.4rem 1rem',
                                                    fontSize: '0.8rem',
                                                    borderRadius: '8px',
                                                    background: '#fef2f2',
                                                    color: '#ef4444',
                                                    border: '1px solid #fecaca'
                                                }}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredConsultas.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        {searchTerm || filterPacienteId
                                            ? 'No se encontraron consultas con esos criterios.'
                                            : 'No hay consultas registradas.'}
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

