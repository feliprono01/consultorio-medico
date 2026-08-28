package com.consultorio.service;

import com.consultorio.exception.ResourceNotFoundException;
import com.consultorio.model.Consulta;
import com.consultorio.model.ConsultaAuditLog;
import com.consultorio.model.EvaluacionPsiquiatrica;
import com.consultorio.model.HistoriaPsiquiatrica;
import com.consultorio.model.Paciente;
import com.consultorio.repository.ConsultaAuditLogRepository;
import com.consultorio.repository.ConsultaRepository;
import com.consultorio.repository.PacienteRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Servicio para la generación de documentos PDF de Historia Clínica.
 * Cumple con el derecho del paciente a acceder a su historia clínica
 * según la Ley 26.529 (Art. 19 y 20 - Derecho a la información).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PdfService {

    private final PacienteRepository pacienteRepository;
    private final ConsultaRepository consultaRepository;
    private final ConsultaAuditLogRepository consultaAuditLogRepository;
    private final com.consultorio.repository.MedicacionRepository medicacionRepository;
    private final AccessLogService accessLogService;

    // --- Datos del membrete (configurables por variables de entorno) ---
    @Value("${pdf.medico.nombre:Dr/a. Nombre Apellido}")
    private String medicoNombre;

    @Value("${pdf.medico.especialidad:M\u00e9dico Psiquiatra}")
    private String medicoEspecialidad;

    @Value("${pdf.medico.matricula:M.N. 000000}")
    private String medicoMatricula;

    @Value("${pdf.medico.direccion:Direcci\u00f3n del Consultorio, Ciudad, Provincia}")
    private String medicoDireccion;

    @Value("${pdf.medico.telefono:Tel: (000) 000-0000}")
    private String medicoTelefono;

    // --- Paleta de colores institucional ---
    private static final Color COLOR_PRIMARIO    = new Color(37, 99, 235);   // Azul institucional
    private static final Color COLOR_SECUNDARIO  = new Color(241, 245, 249); // Gris claro para fondos
    private static final Color COLOR_TEXTO       = new Color(30, 41, 59);    // Casi negro
    private static final Color COLOR_SUBTITULO   = new Color(100, 116, 139); // Gris medio
    private static final Color COLOR_SEPARADOR   = new Color(203, 213, 225); // Gris borde

    // --- Fuentes ---
    private static final Font FUENTE_TITULO      = new Font(Font.HELVETICA, 20, Font.BOLD,   COLOR_PRIMARIO);
    private static final Font FUENTE_SUBTITULO   = new Font(Font.HELVETICA, 10, Font.NORMAL, COLOR_SUBTITULO);
    private static final Font FUENTE_SECCION     = new Font(Font.HELVETICA, 12, Font.BOLD,   COLOR_PRIMARIO);
    private static final Font FUENTE_LABEL       = new Font(Font.HELVETICA,  9, Font.BOLD,   COLOR_TEXTO);
    private static final Font FUENTE_VALOR       = new Font(Font.HELVETICA,  9, Font.NORMAL, COLOR_TEXTO);
    private static final Font FUENTE_PIE         = new Font(Font.HELVETICA,  8, Font.ITALIC, COLOR_SUBTITULO);
    private static final Font FUENTE_CONSULTA_N  = new Font(Font.HELVETICA, 10, Font.BOLD,   new Color(255, 255, 255));

    private static final DateTimeFormatter FMT_FECHA      = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FMT_FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Genera el PDF completo de la Historia Clínica de un paciente.
     *
     * @param pacienteId ID del paciente
     * @return bytes del PDF generado
     */
    @Transactional(readOnly = true)
    public byte[] generarHistoriaClinicaPdf(Long pacienteId) {
        log.info("Generando PDF de Historia Clínica para paciente ID: {}", pacienteId);

        Paciente paciente = pacienteRepository.findByIdAndActiveTrue(pacienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente", "id", pacienteId));

        List<Consulta> consultas = consultaRepository
                .findByPacienteIdAndActiveTrueOrderByFechaConsultaDesc(pacienteId);

        String usuarioActual = SecurityContextHolder.getContext().getAuthentication().getName();

        // Código de verificación: referencia corta y no secreta para que, ante
        // una duda sobre la autenticidad de esta copia puntual, se pueda
        // rastrear en /api/access-logs/paciente/{id} el registro exacto de
        // cuándo se generó y quién lo hizo. No reemplaza una firma digital
        // legal (Ley 25.506) — ver docs/ROADMAP_CUMPLIMIENTO_LEGAL.md.
        java.time.LocalDateTime momentoGeneracion = java.time.LocalDateTime.now();
        String codigoVerificacion = com.consultorio.security.HashChainUtil
                .siguienteHash(com.consultorio.security.HashChainUtil.GENESIS,
                        String.valueOf(pacienteId), momentoGeneracion.toString(), usuarioActual)
                .substring(0, 12)
                .toUpperCase();

        // Auditoría de acceso — exportar la HC completa es la operación más sensible
        // del sistema, tiene que quedar registrada igual que las lecturas de ficha.
        // Se guarda el mismo código de verificación que lleva el PDF, para poder
        // buscar este registro puntual si alguna vez se cuestiona el documento.
        accessLogService.registrar(pacienteId, AccessLogService.VER_HISTORIAL,
                "Exportación PDF de Historia Clínica — código: " + codigoVerificacion);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 40, 40, 50, 60);
            PdfWriter writer = PdfWriter.getInstance(doc, baos);

            // Pie de página con número, metadatos y código de verificación
            writer.setPageEvent(new PiePaginaHandler(usuarioActual, codigoVerificacion));

            doc.open();

            agregarEncabezado(doc, paciente);
            agregarDatosPersonales(doc, paciente);

            if (paciente.getHistoriaPsiquiatrica() != null) {
                agregarHistoriaPsiquiatrica(doc, paciente.getHistoriaPsiquiatrica());
            }

            agregarConsultas(doc, consultas);

            doc.close();
            log.info("PDF generado exitosamente para paciente ID: {}", pacienteId);
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error al generar PDF para paciente ID: {}", pacienteId, e);
            throw new RuntimeException("Error al generar el PDF de la Historia Clínica", e);
        }
    }

    /**
     * Genera el reporte en PDF del historial de auditoría de cambios de una
     * consulta puntual: cada edición registrada, con quién la hizo, cuándo,
     * el valor anterior y el nuevo, y el hash de integridad de la cadena.
     * Pensado para poder entregarse a la justicia o a un perito cuando haga
     * falta demostrar que el registro de cambios no fue alterado.
     *
     * @param consultaId ID de la consulta
     * @return bytes del PDF generado
     */
    @Transactional(readOnly = true)
    public byte[] generarReporteAuditoriaConsulta(Long consultaId) {
        log.info("Generando PDF de auditoría para consulta ID: {}", consultaId);

        Consulta consulta = consultaRepository.findByIdAndActiveTrue(consultaId)
                .orElseThrow(() -> new ResourceNotFoundException("Consulta", "id", consultaId));
        Paciente paciente = consulta.getPaciente();

        List<ConsultaAuditLog> logs = consultaAuditLogRepository.findByConsultaIdOrderByIdAsc(consultaId);

        String usuarioActual = SecurityContextHolder.getContext().getAuthentication().getName();

        accessLogService.registrar(paciente.getId(), AccessLogService.EXPORTAR_AUDITORIA,
                "Exportación PDF de auditoría de la consulta #" + consultaId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 40, 40, 50, 60);
            PdfWriter writer = PdfWriter.getInstance(doc, baos);
            writer.setPageEvent(new PiePaginaHandler(usuarioActual));

            doc.open();

            agregarEncabezadoAuditoria(doc, consulta, paciente);
            agregarTablaAuditoria(doc, logs);
            agregarNotaIntegridad(doc);

            doc.close();
            log.info("PDF de auditoría generado exitosamente para consulta ID: {}", consultaId);
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error al generar PDF de auditoría para consulta ID: {}", consultaId, e);
            throw new RuntimeException("Error al generar el PDF de auditoría de la consulta", e);
        }
    }

    // =========================================================================
    // SECCIONES DEL DOCUMENTO
    // =========================================================================

    private void agregarEncabezado(Document doc, Paciente p) throws DocumentException {
        // Tabla de 2 columnas: membrete del médico (izq) | título del documento (der)
        PdfPTable banner = new PdfPTable(new float[]{1.6f, 1f});
        banner.setWidthPercentage(100);

        // --- Columna izquierda: Membrete del profesional ---
        PdfPCell celdaMembrete = new PdfPCell();
        celdaMembrete.setBackgroundColor(COLOR_PRIMARIO);
        celdaMembrete.setBorder(Rectangle.NO_BORDER);
        celdaMembrete.setPadding(14);

        Font fNombreDoc = new Font(Font.HELVETICA, 14, Font.BOLD,   new Color(255, 255, 255));
        Font fDetalle   = new Font(Font.HELVETICA,  9, Font.NORMAL, new Color(186, 230, 253));
        Font fMatricula = new Font(Font.HELVETICA,  9, Font.BOLD,   new Color(186, 230, 253));

        celdaMembrete.addElement(new Paragraph(medicoNombre,       fNombreDoc));
        celdaMembrete.addElement(new Paragraph(medicoEspecialidad, fDetalle));
        celdaMembrete.addElement(new Paragraph(medicoMatricula,    fMatricula));
        celdaMembrete.addElement(new Paragraph(medicoDireccion,    fDetalle));
        celdaMembrete.addElement(new Paragraph(medicoTelefono,     fDetalle));

        banner.addCell(celdaMembrete);

        // --- Columna derecha: Título + paciente + consentimiento ---
        PdfPCell celdaTitulo = new PdfPCell();
        celdaTitulo.setBackgroundColor(new Color(23, 63, 155)); // azul más oscuro para contraste
        celdaTitulo.setBorder(Rectangle.NO_BORDER);
        celdaTitulo.setPadding(14);
        celdaTitulo.setVerticalAlignment(com.lowagie.text.Element.ALIGN_MIDDLE);

        Paragraph titulo = new Paragraph("HISTORIA\nCL\u00cdNICA", FUENTE_TITULO);
        titulo.getFont().setColor(new Color(255, 255, 255));
        titulo.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
        celdaTitulo.addElement(titulo);

        Paragraph nombrePaciente = new Paragraph(p.getNombreCompleto(),
                new Font(Font.HELVETICA, 11, Font.BOLD, new Color(255, 255, 255)));
        nombrePaciente.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
        celdaTitulo.addElement(nombrePaciente);

        String consentimiento = Boolean.TRUE.equals(p.getConsentimientoInformado())
                ? "\u2714 Consentimiento firmado"
                  + (p.getFechaConsentimiento() != null ? " el " + p.getFechaConsentimiento().format(FMT_FECHA) : "")
                : "\u26a0 Sin consentimiento registrado";
        Paragraph pConsentimiento = new Paragraph(consentimiento,
                new Font(Font.HELVETICA, 7, Font.ITALIC, new Color(186, 230, 253)));
        pConsentimiento.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
        celdaTitulo.addElement(pConsentimiento);

        banner.addCell(celdaTitulo);

        doc.add(banner);
        doc.add(Chunk.NEWLINE);
    }

    private void agregarDatosPersonales(Document doc, Paciente p) throws DocumentException {
        agregarTituloSeccion(doc, "DATOS DEL PACIENTE");

        PdfPTable tabla = new PdfPTable(4);
        tabla.setWidthPercentage(100);
        tabla.setSpacingBefore(4);
        tabla.setWidths(new float[]{1.5f, 2.5f, 1.5f, 2.5f});

        agregarFilaTabla(tabla, "DNI",              nvl(p.getDni()));
        agregarFilaTabla(tabla, "Fecha Nac.",       p.getFechaNacimiento() != null ? p.getFechaNacimiento().format(FMT_FECHA) : "-");
        agregarFilaTabla(tabla, "Email",            nvl(p.getEmail()));
        agregarFilaTabla(tabla, "Teléfono",         nvl(p.getTelefono()));
        agregarFilaTabla(tabla, "Sexo",             nvl(p.getSexo()));
        agregarFilaTabla(tabla, "Estado Civil",     nvl(p.getEstadoCivil()));
        agregarFilaTabla(tabla, "Ocupación",        nvl(p.getOcupacion()));
        agregarFilaTabla(tabla, "Escolaridad",      nvl(p.getEscolaridad()));
        agregarFilaTabla(tabla, "Ciudad",           nvl(p.getCiudad()));
        agregarFilaTabla(tabla, "Dirección",        nvl(p.getDireccion()));

        doc.add(tabla);

        // Datos familiares (a ancho completo)
        agregarCampoTextoLargo(doc, "Datos de Padres",   p.getDatosPadres());
        agregarCampoTextoLargo(doc, "Datos de Hijos",    p.getDatosHijos());
        agregarCampoTextoLargo(doc, "Datos de Hermanos", p.getDatosHermanos());

        doc.add(Chunk.NEWLINE);
    }

    private void agregarHistoriaPsiquiatrica(Document doc, HistoriaPsiquiatrica hp) throws DocumentException {
        agregarTituloSeccion(doc, "HISTORIA PSIQUIÁTRICA");

        agregarCampoTextoLargo(doc, "Antecedentes Familiares",    hp.getAntecedentesFamiliares());
        agregarCampoTextoLargo(doc, "Antecedentes Personales",    hp.getAntecedentesPersonales());
        agregarCampoTextoLargo(doc, "Historia de Consumo",        hp.getHistoriaConsumo());
        agregarCampoTextoLargo(doc, "Enfermedad Actual",          hp.getEnfermedadActual());
        agregarCampoTextoLargo(doc, "Tratamientos Previos",       hp.getTratamientosPrevios());
        agregarCampoTextoLargo(doc, "Desarrollo Psicomotor",      hp.getDesarrolloPsicomotor());
        agregarCampoTextoLargo(doc, "Personalidad Previa",        hp.getPersonalidadPrevia());
        agregarCampoTextoLargo(doc, "Antecedentes Psicológicos",  hp.getAntecedentesPsicologicos());
        agregarCampoTextoLargo(doc, "Historia Sexual",            hp.getHistoriaSexual());
        agregarCampoTextoLargo(doc, "Historia Marital",           hp.getHistoriaMarital());
        agregarCampoTextoLargo(doc, "Hábitos Generales",          hp.getHabitos());

        doc.add(Chunk.NEWLINE);
    }

    private void agregarConsultas(Document doc, List<Consulta> consultas) throws DocumentException {
        agregarTituloSeccion(doc, "CONSULTAS (" + consultas.size() + " registradas)");

        if (consultas.isEmpty()) {
            doc.add(new Paragraph("Sin consultas registradas.", FUENTE_VALOR));
            return;
        }

        for (int i = 0; i < consultas.size(); i++) {
            Consulta c = consultas.get(i);
            agregarTarjetaConsulta(doc, c, i + 1);
        }
    }

    private void agregarTarjetaConsulta(Document doc, Consulta c, int numero) throws DocumentException {
        // Encabezado de la tarjeta
        PdfPTable header = new PdfPTable(1);
        header.setWidthPercentage(100);
        header.setSpacingBefore(10);

        PdfPCell headerCell = new PdfPCell();
        headerCell.setBackgroundColor(COLOR_PRIMARIO);
        headerCell.setBorder(Rectangle.NO_BORDER);
        headerCell.setPaddingTop(6);
        headerCell.setPaddingBottom(6);
        headerCell.setPaddingLeft(10);

        String fechaStr = c.getFechaConsulta() != null ? c.getFechaConsulta().format(FMT_FECHA_HORA) : "-";
        headerCell.addElement(new Paragraph("Consulta #" + numero + "   |   " + fechaStr, FUENTE_CONSULTA_N));
        header.addCell(headerCell);
        doc.add(header);

        // Contenido de la tarjeta (fondo gris claro)
        PdfPTable body = new PdfPTable(1);
        body.setWidthPercentage(100);

        PdfPCell bodyCell = new PdfPCell();
        bodyCell.setBackgroundColor(COLOR_SECUNDARIO);
        bodyCell.setBorderColor(COLOR_SEPARADOR);
        bodyCell.setBorderWidth(0.5f);
        bodyCell.setPadding(10);

        agregarParrafoCampo(bodyCell, "Motivo de Consulta", c.getMotivo());
        agregarParrafoCampo(bodyCell, "Diagnóstico",        c.getDiagnostico());
        agregarParrafoCampo(bodyCell, "Tratamiento",        c.getTratamiento());

        List<com.consultorio.model.Medicacion> medicaciones = medicacionRepository.findByConsultaIdOrderByIdAsc(c.getId());
        if (!medicaciones.isEmpty()) {
            bodyCell.addElement(new Paragraph("Medicación:", FUENTE_LABEL));
            for (com.consultorio.model.Medicacion m : medicaciones) {
                String linea = String.join(" — ", java.util.stream.Stream
                        .of(m.getFarmaco(), m.getDosis(), m.getFrecuencia())
                        .filter(s -> s != null && !s.isBlank())
                        .toList());
                Paragraph p = new Paragraph("• " + linea, FUENTE_VALOR);
                p.setIndentationLeft(8);
                bodyCell.addElement(p);
            }
            bodyCell.addElement(Chunk.NEWLINE);
        }

        agregarParrafoCampo(bodyCell, "Notas",              c.getNotas());

        // Escalas funcionales (si existen)
        if (tieneEscalas(c)) {
            bodyCell.addElement(new Paragraph("Escalas Funcionales:", FUENTE_LABEL));
            String escalas = String.format(
                    "Estado de ánimo: %s  |  Sueño: %s  |  Alimentación: %s  |  Sociabilidad: %s  |  Func. Laboral: %s  |  Func. Social: %s  |  Func. Familiar: %s",
                    nvlInt(c.getEstadoAnimo()), nvlInt(c.getCalidadSueno()), nvlInt(c.getAlimentacion()),
                    nvlInt(c.getSociabilidad()), nvlInt(c.getFuncionalidadLaboral()),
                    nvlInt(c.getFuncionalidadSocial()), nvlInt(c.getFuncionalidadFamiliar()));
            bodyCell.addElement(new Paragraph(escalas, FUENTE_VALOR));
            bodyCell.addElement(Chunk.NEWLINE);
        }

        // Evaluación psiquiátrica (si existe)
        EvaluacionPsiquiatrica ev = c.getEvaluacionPsiquiatrica();
        if (ev != null) {
            bodyCell.addElement(new Paragraph("Evaluación Psiquiátrica:", FUENTE_LABEL));

            PdfPTable evTable = new PdfPTable(4);
            evTable.setWidthPercentage(100);
            evTable.setWidths(new float[]{1.5f, 2.5f, 1.5f, 2.5f});
            evTable.setSpacingBefore(4);

            agregarFilaTablaInterno(evTable, "Apariencia",      nvl(ev.getApariencia()));
            agregarFilaTablaInterno(evTable, "Conducta",        nvl(ev.getConducta()));
            agregarFilaTablaInterno(evTable, "Lenguaje",        nvl(ev.getLenguaje()));
            agregarFilaTablaInterno(evTable, "Ánimo",           nvl(ev.getAnimo()));
            agregarFilaTablaInterno(evTable, "Afecto",          nvl(ev.getAfecto()));
            agregarFilaTablaInterno(evTable, "Pensamiento",     nvl(ev.getPensamiento()));
            agregarFilaTablaInterno(evTable, "Sensopercepción", nvl(ev.getSensopercepcion()));
            agregarFilaTablaInterno(evTable, "Juicio",          nvl(ev.getJuicio()));
            agregarFilaTablaInterno(evTable, "Memoria",         nvl(ev.getMemoria()));
            agregarFilaTablaInterno(evTable, "Atención",        nvl(ev.getAtencion()));
            agregarFilaTablaInterno(evTable, "Conciencia",      nvl(ev.getConciencia()));
            agregarFilaTablaInterno(evTable, "Orientación",     nvl(ev.getOrientacion()));
            agregarFilaTablaInterno(evTable, "Riesgo Suicida",  nvl(ev.getRiesgoSuicida()));
            agregarFilaTablaInterno(evTable, "Riesgo Homicida", nvl(ev.getRiesgoHomicida()));
            agregarFilaTablaInterno(evTable, "Riesgo Propio",   nvl(ev.getRiesgoPropio()));
            agregarFilaTablaInterno(evTable, "Eje 1",           nvl(ev.getEje1()));
            agregarFilaTablaInterno(evTable, "Eje 2",           nvl(ev.getEje2()));
            agregarFilaTablaInterno(evTable, "Eje 3",           nvl(ev.getEje3()));
            agregarFilaTablaInterno(evTable, "Adherencia",      nvl(ev.getAdherenciaTratamiento()));
            agregarFilaTablaInterno(evTable, "Efectos Adv.",    nvl(ev.getEfectosAdversos()));

            bodyCell.addElement(evTable);
        }

        body.addCell(bodyCell);
        doc.add(body);
    }

    private void agregarEncabezadoAuditoria(Document doc, Consulta c, Paciente p) throws DocumentException {
        PdfPTable banner = new PdfPTable(1);
        banner.setWidthPercentage(100);

        PdfPCell celda = new PdfPCell();
        celda.setBackgroundColor(COLOR_PRIMARIO);
        celda.setBorder(Rectangle.NO_BORDER);
        celda.setPadding(14);

        Paragraph titulo = new Paragraph("REPORTE DE AUDITORÍA DE CAMBIOS",
                new Font(Font.HELVETICA, 16, Font.BOLD, new Color(255, 255, 255)));
        celda.addElement(titulo);

        Font fDetalle = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(186, 230, 253));
        String fechaStr = c.getFechaConsulta() != null ? c.getFechaConsulta().format(FMT_FECHA_HORA) : "-";
        celda.addElement(new Paragraph("Consulta #" + c.getId() + "   |   " + fechaStr, fDetalle));
        celda.addElement(new Paragraph("Paciente: " + p.getNombreCompleto() + "   |   DNI: " + nvl(p.getDni()), fDetalle));

        banner.addCell(celda);
        doc.add(banner);
        doc.add(Chunk.NEWLINE);
    }

    private void agregarTablaAuditoria(Document doc, List<ConsultaAuditLog> logs) throws DocumentException {
        agregarTituloSeccion(doc, "CAMBIOS REGISTRADOS (" + logs.size() + ")");

        if (logs.isEmpty()) {
            doc.add(new Paragraph("Esta consulta no tiene cambios posteriores a su creación.", FUENTE_VALOR));
            return;
        }

        Font fCampo = new Font(Font.HELVETICA, 8, Font.BOLD, COLOR_TEXTO);
        Font fMeta  = new Font(Font.HELVETICA, 7, Font.NORMAL, COLOR_SUBTITULO);
        Font fValor = new Font(Font.HELVETICA, 7, Font.NORMAL, COLOR_TEXTO);
        Font fHash  = new Font(Font.COURIER,   6, Font.NORMAL, COLOR_SUBTITULO);

        for (ConsultaAuditLog registro : logs) {
            PdfPTable tabla = new PdfPTable(1);
            tabla.setWidthPercentage(100);
            tabla.setSpacingBefore(8);

            PdfPCell cell = new PdfPCell();
            cell.setBackgroundColor(COLOR_SECUNDARIO);
            cell.setBorderColor(COLOR_SEPARADOR);
            cell.setBorderWidth(0.5f);
            cell.setPadding(8);

            String fecha = registro.getFechaCambio() != null ? registro.getFechaCambio().format(FMT_FECHA_HORA) : "-";
            cell.addElement(new Paragraph(registro.getCampo(), fCampo));
            cell.addElement(new Paragraph("Modificado por " + registro.getModificadoPor() + "  —  " + fecha, fMeta));

            Paragraph anterior = new Paragraph();
            anterior.add(new Chunk("Valor anterior: ", fCampo));
            anterior.add(new Chunk(nvl(registro.getValorAnterior()), fValor));
            anterior.setSpacingBefore(4);
            cell.addElement(anterior);

            Paragraph nuevo = new Paragraph();
            nuevo.add(new Chunk("Valor nuevo: ", fCampo));
            nuevo.add(new Chunk(nvl(registro.getValorNuevo()), fValor));
            cell.addElement(nuevo);

            Paragraph hash = new Paragraph("hash: " + nvl(registro.getHash())
                    + "   |   anterior: " + nvl(registro.getHashAnterior()), fHash);
            hash.setSpacingBefore(4);
            cell.addElement(hash);

            tabla.addCell(cell);
            doc.add(tabla);
        }
    }

    private void agregarNotaIntegridad(Document doc) throws DocumentException {
        doc.add(Chunk.NEWLINE);
        Paragraph nota = new Paragraph(
                "Nota sobre integridad: cada registro de este listado guarda el hash SHA-256 de su propio "
                        + "contenido y el hash del registro anterior de la tabla, formando una cadena de "
                        + "integridad (similar a un libro contable inalterable). Si un registro fuera editado "
                        + "o borrado por fuera de la aplicación —incluso con acceso directo a la base de "
                        + "datos—, la cadena se rompe a partir de ese punto. La validez de este reporte no se "
                        + "determina mirando un registro aislado, sino verificando la cadena completa contra el "
                        + "sistema en el momento de la pericia.",
                FUENTE_PIE);
        doc.add(nota);
    }

    // =========================================================================
    // HELPERS DE CONSTRUCCIÓN
    // =========================================================================

    private void agregarTituloSeccion(Document doc, String titulo) throws DocumentException {
        Paragraph p = new Paragraph(titulo, FUENTE_SECCION);
        p.setSpacingBefore(14);
        p.setSpacingAfter(2);
        doc.add(p);

        // Línea separadora
        PdfPTable linea = new PdfPTable(1);
        linea.setWidthPercentage(100);
        PdfPCell c = new PdfPCell();
        c.setBorderWidthTop(1.5f);
        c.setBorderColorTop(COLOR_PRIMARIO);
        c.setBorderWidthBottom(0);
        c.setBorderWidthLeft(0);
        c.setBorderWidthRight(0);
        c.setPaddingBottom(4);
        linea.addCell(c);
        doc.add(linea);
    }

    private void agregarFilaTabla(PdfPTable tabla, String label, String valor) {
        PdfPCell cLabel = new PdfPCell(new Phrase(label, FUENTE_LABEL));
        cLabel.setBorderColor(COLOR_SEPARADOR);
        cLabel.setPadding(5);
        cLabel.setBackgroundColor(new Color(226, 232, 240));

        PdfPCell cValor = new PdfPCell(new Phrase(valor, FUENTE_VALOR));
        cValor.setBorderColor(COLOR_SEPARADOR);
        cValor.setPadding(5);

        tabla.addCell(cLabel);
        tabla.addCell(cValor);
    }

    private void agregarFilaTablaInterno(PdfPTable tabla, String label, String valor) {
        PdfPCell cLabel = new PdfPCell(new Phrase(label, new Font(Font.HELVETICA, 8, Font.BOLD, COLOR_TEXTO)));
        cLabel.setBorderColor(COLOR_SEPARADOR);
        cLabel.setPadding(3);
        cLabel.setBackgroundColor(new Color(248, 250, 252));

        PdfPCell cValor = new PdfPCell(new Phrase(valor, new Font(Font.HELVETICA, 8, Font.NORMAL, COLOR_TEXTO)));
        cValor.setBorderColor(COLOR_SEPARADOR);
        cValor.setPadding(3);

        tabla.addCell(cLabel);
        tabla.addCell(cValor);
    }

    private void agregarCampoTextoLargo(Document doc, String label, String valor) throws DocumentException {
        if (valor == null || valor.isBlank()) return;
        doc.add(new Paragraph(label + ":", FUENTE_LABEL));
        Paragraph p = new Paragraph(valor, FUENTE_VALOR);
        p.setIndentationLeft(12);
        p.setSpacingAfter(4);
        doc.add(p);
    }

    private void agregarParrafoCampo(PdfPCell cell, String label, String valor) throws DocumentException {
        if (valor == null || valor.isBlank()) return;
        cell.addElement(new Paragraph(label + ":", FUENTE_LABEL));
        Paragraph p = new Paragraph(valor, FUENTE_VALOR);
        p.setIndentationLeft(8);
        p.setSpacingAfter(5);
        cell.addElement(p);
    }

    private boolean tieneEscalas(Consulta c) {
        return c.getEstadoAnimo() != null || c.getCalidadSueno() != null
                || c.getAlimentacion() != null || c.getSociabilidad() != null
                || c.getFuncionalidadLaboral() != null || c.getFuncionalidadSocial() != null
                || c.getFuncionalidadFamiliar() != null;
    }

    private String nvl(String valor) {
        return (valor == null || valor.isBlank()) ? "-" : valor;
    }

    private String nvlInt(Integer valor) {
        return valor == null ? "-" : String.valueOf(valor) + "/10";
    }

    // =========================================================================
    // MANEJADOR DE PIE DE PÁGINA
    // =========================================================================

    /**
     * Agrega número de página y metadatos al pie de cada hoja del PDF.
     */
    private static class PiePaginaHandler extends com.lowagie.text.pdf.PdfPageEventHelper {
        private final String usuarioGenerador;
        private final String fechaGeneracion;
        private final String codigoVerificacion;

        PiePaginaHandler(String usuario) {
            this(usuario, null);
        }

        /**
         * @param codigoVerificacion referencia corta para poder rastrear esta
         *                           exportación puntual en /api/access-logs si
         *                           alguna vez se cuestiona la autenticidad del
         *                           documento — no es una firma digital legal
         *                           (Ley 25.506), es una ayuda práctica. Null
         *                           para no imprimir nada (ej. en el PDF de
         *                           auditoría, que ya lleva hash por fila).
         */
        PiePaginaHandler(String usuario, String codigoVerificacion) {
            this.usuarioGenerador = usuario;
            this.codigoVerificacion = codigoVerificacion;
            this.fechaGeneracion = java.time.LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            try {
                com.lowagie.text.pdf.PdfContentByte cb = writer.getDirectContent();
                Font fuentePie = new Font(Font.HELVETICA, 7, Font.ITALIC, COLOR_SUBTITULO);

                // Línea superior del pie
                cb.setColorStroke(COLOR_SEPARADOR);
                cb.setLineWidth(0.5f);
                cb.moveTo(document.left(), document.bottom() - 10);
                cb.lineTo(document.right(), document.bottom() - 10);
                cb.stroke();

                // Texto izquierdo: metadatos (+ código de verificación si corresponde)
                String textoPie = "Documento confidencial | Generado: " + fechaGeneracion + " | Usuario: " + usuarioGenerador;
                if (codigoVerificacion != null) {
                    textoPie += " | Código de verificación: " + codigoVerificacion;
                }
                Phrase pieIzq = new Phrase(textoPie, fuentePie);
                com.lowagie.text.pdf.ColumnText.showTextAligned(cb,
                        com.lowagie.text.Element.ALIGN_LEFT, pieIzq,
                        document.left(), document.bottom() - 22, 0);

                // Texto derecho: número de página
                Phrase pieDer = new Phrase("Pág. " + writer.getPageNumber(), fuentePie);
                com.lowagie.text.pdf.ColumnText.showTextAligned(cb,
                        com.lowagie.text.Element.ALIGN_RIGHT, pieDer,
                        document.right(), document.bottom() - 22, 0);

            } catch (Exception e) {
                // No interrumpir la generación del PDF por un error en el pie
            }
        }
    }
}
