import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { pacienteService } from '../api/pacienteService';

/**
 * Genera el PDF de una consulta y lo abre en una pestaña nueva.
 * `pdfWindow` se abre ANTES de la llamada de red (patrón necesario para
 * que los navegadores no bloqueen el popup por no venir de un click directo).
 */
export async function generateConsultaPdf(c) {
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
        doc.text(`Fecha de Atención: ${new Date(c.fechaConsulta).toLocaleDateString()} ${new Date(c.fechaConsulta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 14, 52);

        doc.setFontSize(12); doc.setTextColor(8, 145, 178);
        doc.text('Detalles Clínicos', 14, 65);
        doc.line(14, 67, 100, 67);

        generateTable(doc, {
            startY: 75,
            head: [['Concepto', 'Descripción']],
            body: [
                ['Motivo de Consulta', c.motivo || 'N/A'],
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
}
