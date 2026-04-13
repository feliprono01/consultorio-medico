-- Script para cargar 3 consultas de prueba
-- Asumiendo que ya existen pacientes en la tabla

-- Primero, obtener IDs de pacientes existentes
SET @paciente1 = (SELECT id FROM pacientes WHERE active = 1 LIMIT 1);
SET @paciente2 = (SELECT id FROM pacientes WHERE active = 1 LIMIT 1 OFFSET 1);
SET @paciente3 = (SELECT id FROM pacientes WHERE active = 1 LIMIT 1 OFFSET 2);

-- Si no hay suficientes pacientes, crear algunos
INSERT IGNORE INTO pacientes (nombre, apellido, dni, fecha_nacimiento, telefono, email, direccion, obra_social, numero_afiliado, active, created_at, updated_at, created_by, last_modified_by)
VALUES 
('María', 'González', '35678901', '1990-05-15', '1145678901', 'maria.gonzalez@email.com', 'Av. Corrientes 1234', 'OSDE', '12345678', 1, NOW(), NOW(), 'admin', 'admin'),
('Carlos', 'Rodríguez', '28456789', '1985-08-22', '1156789012', 'carlos.rodriguez@email.com', 'Av. Santa Fe 5678', 'Swiss Medical', '87654321', 1, NOW(), NOW(), 'admin', 'admin'),
('Laura', 'Martínez', '32123456', '1988-03-10', '1167890123', 'laura.martinez@email.com', 'Av. Cabildo 9012', 'Galeno', '11223344', 1, NOW(), NOW(), 'admin', 'admin');

-- Actualizar las variables con los IDs correctos
SET @paciente1 = (SELECT id FROM pacientes WHERE dni = '35678901');
SET @paciente2 = (SELECT id FROM pacientes WHERE dni = '28456789');
SET @paciente3 = (SELECT id FROM pacientes WHERE dni = '32123456');

-- Consulta 1: Primera sesión con evaluación completa
INSERT INTO consultas (
    paciente_id, fecha_consulta, motivo, motivo_consulta, diagnostico, tratamiento, notas, 
    estado_animo, calidad_sueno, active, created_at, updated_at, created_by, last_modified_by
) VALUES (
    @paciente1, 
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    'Primera consulta - Evaluación inicial',
    'Primera consulta - Evaluación inicial',
    'F32.1 - Episodio depresivo moderado',
    'Sertralina 50mg/día - Terapia cognitivo-conductual semanal',
    'Paciente refiere sintomatología depresiva de 3 meses de evolución. Insomnio de conciliación. Sin ideas de muerte actuales. Buen insight. Adherencia esperada.',
    'Bajo - Tristeza persistente con llanto fácil',
    'Mala - Insomnio de conciliación (2-3 horas para dormir)',
    1, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), 'admin', 'admin'
);

SET @consulta1_id = LAST_INSERT_ID();

-- Evaluación Psiquiátrica para Consulta 1
INSERT INTO evaluacion_psiquiatrica (
    consulta_id, apariencia, conducta, lenguaje, animo, afecto, pensamiento, 
    sensopercepcion, juicio, memoria, atencion, conciencia, 
    riesgo_suicida, riesgo_homicida, riesgo_propio,
    eje1, eje2, eje3, adherencia_tratamiento, efectos_adversos
) VALUES (
    @consulta1_id,
    'Adecuada al contexto, higiene conservada',
    'Contacto adecuado, colaborador',
    'Fluido, coherente, tono bajo',
    'Tristeza, llanto fácil',
    'Hipotímico, restringido',
    'Sin alteraciones formales, contenido con ideas de minusvalía',
    'Sin alteraciones',
    'Conservado',
    'Sin alteraciones',
    'Levemente disminuida',
    'Lúcido, orientado en tiempo, espacio y persona',
    'Bajo - Sin ideación activa',
    'Nulo',
    'Bajo',
    'F32.1 - Episodio depresivo moderado',
    'Sin diagnóstico en Eje II',
    'Sin patología médica relevante',
    NULL,
    NULL
);

-- Consulta 2: Seguimiento - Ansiedad
INSERT INTO consultas (
    paciente_id, fecha_consulta, motivo, motivo_consulta, diagnostico, tratamiento, notas,
    estado_animo, calidad_sueno, active, created_at, updated_at, created_by, last_modified_by
) VALUES (
    @paciente2,
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    'Control - Crisis de pánico',
    'Control - Crisis de pánico',
    'F41.0 - Trastorno de pánico sin agorafobia',
    'Alprazolam 0.5mg SOS (máx 2/día) - Clonazepam 0.5mg/noche - Técnicas de respiración',
    'Paciente refiere 2 crisis en la última semana. Mejoría parcial con benzodiacepinas. Se refuerzan técnicas de manejo de ansiedad. Próximo control en 1 semana.',
    'Ansioso - Preocupación constante',
    'Regular - Despertares nocturnos por ansiedad',
    1, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), 'admin', 'admin'
);

SET @consulta2_id = LAST_INSERT_ID();

-- Evaluación Psiquiátrica para Consulta 2
INSERT INTO evaluacion_psiquiatrica (
    consulta_id, apariencia, conducta, lenguaje, animo, afecto, pensamiento,
    sensopercepcion, juicio, memoria, atencion, conciencia,
    riesgo_suicida, riesgo_homicida, riesgo_propio,
    eje1, eje2, eje3, adherencia_tratamiento, efectos_adversos
) VALUES (
    @consulta2_id,
    'Inquieto, sudoración palmar',
    'Ansioso, hipervigilante',
    'Rápido, entrecortado',
    'Ansioso, temeroso',
    'Ansioso',
    'Preocupaciones múltiples, anticipación catastrófica',
    'Sin alteraciones',
    'Conservado',
    'Sin alteraciones',
    'Hiperprosexia',
    'Lúcido, orientado',
    'Nulo',
    'Nulo',
    'Medio - Evitación de situaciones',
    'F41.0 - Trastorno de pánico',
    'Rasgos ansiosos de personalidad',
    'Sin comorbilidad médica',
    'Buena - Toma medicación según indicación',
    'Leve somnolencia diurna con clonazepam'
);

-- Consulta 3: Evaluación - Insomnio crónico
INSERT INTO consultas (
    paciente_id, fecha_consulta, motivo, motivo_consulta, diagnostico, tratamiento, notas,
    estado_animo, calidad_sueno, active, created_at, updated_at, created_by, last_modified_by
) VALUES (
    @paciente3,
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    'Insomnio crónico - Derivación de médico clínico',
    'Insomnio crónico - Derivación de médico clínico',
    'F51.0 - Insomnio no orgánico - G47.0 - Trastornos del inicio y mantenimiento del sueño',
    'Higiene del sueño - Trazodona 50mg/noche - Restricción de tiempo en cama',
    'Paciente con insomnio de 6 meses de evolución. Latencia de sueño >2 horas. Múltiples despertares. Se descartó apnea del sueño. Intentó melatonina sin resultados. Se inicia tratamiento farmacológico + medidas conductuales.',
    'Normal - Sin síntomas afectivos',
    'Muy mala - Menos de 4 horas de sueño efectivo',
    1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 'admin', 'admin'
);

SET @consulta3_id = LAST_INSERT_ID();

-- Evaluación Psiquiátrica para Consulta 3
INSERT INTO evaluacion_psiquiatrica (
    consulta_id, apariencia, conducta, lenguaje, animo, afecto, pensamiento,
    sensopercepcion, juicio, memoria, atencion, conciencia,
    riesgo_suicida, riesgo_homicida, riesgo_propio,
    eje1, eje2, eje3, adherencia_tratamiento, efectos_adversos
) VALUES (
    @consulta3_id,
    'Fatigado, ojeras marcadas',
    'Colaborador, cansancio evidente',
    'Pausado por fatiga',
    'Eutímico',
    'Adecuado',
    'Sin alteraciones, preocupación por falta de sueño',
    'Sin alteraciones',
    'Conservado',
    'Quejas subjetivas de olvidos por falta de sueño',
    'Reducida por fatiga',
    'Lúcido, orientado',
    'Nulo',
    'Nulo',
    'Bajo',
    'F51.0 - Insomnio no orgánico',
    'Sin diagnóstico',
    'Descartada apnea del sueño por polisomnografía',
    NULL,
    NULL
);

-- Verificar que las consultas se crearon correctamente
SELECT 
    c.id,
    CONCAT(p.nombre, ' ', p.apellido) as paciente,
    c.fecha_consulta,
    c.motivo,
    c.diagnostico
FROM consultas c
JOIN pacientes p ON c.paciente_id = p.id
WHERE c.id IN (@consulta1_id, @consulta2_id, @consulta3_id)
ORDER BY c.fecha_consulta DESC;
