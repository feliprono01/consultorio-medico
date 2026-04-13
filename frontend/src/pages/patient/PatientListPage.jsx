import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { pacienteService } from '../../api/pacienteService';
import { consultaService } from '../../api/consultaService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PatientListPage() {
    const [pacientes, setPacientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await pacienteService.getAll();
                setPacientes(response.data);
            } catch (err) {
                console.error(err);
                setError('Error al cargar pacientes.');
            } finally {
                setLoading(false);
            }
        };
        fetchPacientes();
    }, []);

    const filteredPacientes = pacientes.filter(p => {
        const term = searchTerm.toLowerCase();
        return (
            p.nombre.toLowerCase().includes(term) ||
            p.apellido.toLowerCase().includes(term) ||
            p.dni.toLowerCase().includes(term)
        );
    });

    const handleDelete = async (e, id) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (window.confirm('¿Estás seguro de que quieres eliminar este paciente? Esta acción no se puede deshacer.')) {
            try {
                await pacienteService.delete(id);
                setPacientes(pacientes.filter(p => p.id !== id));
            } catch (err) {
                console.error(err);
                alert('Hubo un error al eliminar el paciente.');
            }
        }
    };

    const generatePDF = async (patient) => {
        // 1. Open window immediately to avoid popup blockers
        const pdfWindow = window.open('', '_blank');

        if (!pdfWindow) {
            alert("Por favor, permite las ventanas emergentes para ver el PDF.");
            return;
        }

        pdfWindow.document.write('<html><body><h3>Generando Resumen Clínico...</h3><p>Por favor espere mientras se cargan los datos.</p></body></html>');

        try {
            // 2. Fetch Data
            const patientRes = await pacienteService.getById(patient.id);
            const fullPatient = patientRes.data;
            const history = fullPatient.historiaPsiquiatrica || {};

            const consultsRes = await consultaService.getByPaciente(patient.id);            const consultations = consultsRes.data;

            const doc = new jsPDF();

            // HEADER
            doc.setFillColor(37, 99, 235); // Blue
            doc.rect(0, 0, 210, 25, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.text('Resumen Clínico Integral', 105, 15, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Generado: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

            // 1. PERSONAL DATA
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setTextColor(37, 99, 235);
            doc.text('1. Datos del Paciente', 14, 35);
            doc.line(14, 37, 196, 37);

            // IMPORTS
            const generateTable = autoTable.default || autoTable;

            if (typeof generateTable !== 'function') {
                throw new Error("jspdf-autotable failed to load.");
            }

            generateTable(doc, {
                startY: 40,
                head: [],
                body: [
                    ['Nombre Completo', `${fullPatient.nombre} ${fullPatient.apellido}`],
                    ['DNI', fullPatient.dni],
                    ['Edad', fullPatient.fechaNacimiento ? `${new Date().getFullYear() - new Date(fullPatient.fechaNacimiento).getFullYear()} años` : 'N/A'],
                    ['Teléfono', fullPatient.telefono || 'N/A'],
                    ['Email', fullPatient.email]
                ],
                theme: 'plain',
                styles: { cellPadding: 2, fontSize: 10 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
            });

            // 2. PSYCHIATRIC HISTORY
            let finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 40;
            finalY += 10;
            doc.setFontSize(12);
            doc.setTextColor(37, 99, 235);
            doc.text('2. Historia Clínica (Antecedentes)', 14, finalY);
            doc.line(14, finalY + 2, 196, finalY + 2);

            const historyData = [
                ['Antecedentes Heredofamiliares', history.antecedentesFamiliares || 'Sin registro'],
                ['Antecedentes Personales', history.antecedentesPersonales || 'Sin registro'],
                ['Historia de Consumo', history.historiaConsumo || 'Sin registro'],
                ['Desarrollo Psicomotor', history.desarrolloPsicomotor || 'Sin registro'],
                ['Personalidad Previa', history.personalidadPrevia || 'Sin registro'],
                ['Tratamientos Previos', history.tratamientosPrevios || 'Sin registro'],
                ['Enfermedad Actual', history.enfermedadActual || 'Sin registro']
            ];

            generateTable(doc, {
                startY: finalY + 5,
                head: [['Antecedente', 'Descripción']],
                body: historyData,
                theme: 'striped',
                headStyles: { fillColor: [100, 116, 139] },
                styles: { cellPadding: 4, overflow: 'linebreak' },
                columnStyles: { 0: { cellWidth: 60 } }
            });

            // 3. CONSULTATION HISTORY
            finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || finalY;
            finalY += 10;

            // Check page break
            if (finalY > 250) {
                doc.addPage();
                finalY = 20;
            }

            doc.setFontSize(12);
            doc.setTextColor(37, 99, 235);
            doc.text('3. Historial de Consultas', 14, finalY);
            doc.line(14, finalY + 2, 196, finalY + 2);

            if (consultations.length > 0) {
                const consultRows = consultations.map(c => [
                    new Date(c.fechaConsulta).toLocaleDateString(),
                    c.motivoConsulta || '',
                    c.diagnostico || '',
                    c.tratamiento || '',
                    // Summarize risks if present
                    c.evaluacionPsiquiatrica ?
                        `R.S: ${c.evaluacionPsiquiatrica.riesgoSuicida}\nR.H: ${c.evaluacionPsiquiatrica.riesgoHomicida}` : 'N/A'
                ]);

                generateTable(doc, {
                    startY: finalY + 5,
                    head: [['Fecha', 'Motivo', 'Diagnóstico', 'Tratamiento', 'Riesgos']],
                    body: consultRows,
                    theme: 'grid',
                    headStyles: { fillColor: [37, 99, 235] },
                    styles: { fontSize: 9, cellPadding: 3 },
                    columnStyles: {
                        0: { cellWidth: 25 },
                        4: { cellWidth: 30 }
                    }
                });
            } else {
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text('No hay consultas registradas.', 14, finalY + 10);
            }

            // FOOTER
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Página ${i} de ${pageCount}`, 196, 290, { align: 'right' });
            }

            // Generate Blob URL
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);

            // Navigate the pre-opened window to the Blob URL
            pdfWindow.location.href = url;

        } catch (err) {
            console.error("Critical error in generatePDF:", err);
            // Show error in the new window if possible, or alert
            if (pdfWindow) {
                pdfWindow.document.body.innerHTML = `<h3 style="color:red">Error</h3><p>${err.message}</p>`;
            } else {
                alert('Error al generar el PDF: ' + err.message);
            }
        }
    };

    if (loading) return <p>Cargando...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Pacientes</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Gestión de historia clínica</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o DNI..."
                        className="form-input"
                        style={{ padding: '0.6rem 1rem', width: '300px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Link to="/pacientes/new" className="btn">
                        + Nuevo Paciente
                    </Link>
                </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table>
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '2rem' }}>Nombre</th>
                            <th>DNI</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th style={{ paddingRight: '2rem', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPacientes.map(paciente => (
                            <tr key={paciente.id}>
                                <td style={{ paddingLeft: '2rem', fontWeight: 500 }}>{paciente.nombre} {paciente.apellido}</td>
                                <td>{paciente.dni}</td>
                                <td>{paciente.email}</td>
                                <td>{paciente.telefono}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingRight: '2rem' }}>
                                        <button
                                            onClick={() => generatePDF(paciente)}
                                            className="btn btn-secondary"
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                fontSize: '0.8rem',
                                                borderRadius: '8px',
                                                background: '#eff6ff',
                                                color: '#2563eb',
                                                border: '1px solid #bfdbfe'
                                            }}>
                                            Resumen PDF
                                        </button>
                                        <button
                                            onClick={() => navigate(`/pacientes/evolucion/${paciente.id}`)}
                                            className="btn btn-secondary"
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                fontSize: '0.8rem',
                                                borderRadius: '8px',
                                                background: '#f0fdf4',
                                                color: '#15803d',
                                                border: '1px solid #bbf7d0'
                                            }}>
                                            Evolución
                                        </button>
                                        <button
                                            onClick={() => navigate(`/consultas?pacienteId=${paciente.id}`)}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                                            Historia
                                        </button>
                                        <button
                                            onClick={() => navigate(`/pacientes/edit/${paciente.id}`)}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDelete(e, paciente.id)}
                                            className="btn btn-secondary"
                                            style={{
                                                padding: '0.4rem 0.8rem',
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
                        {filteredPacientes.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No se encontraron pacientes que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

