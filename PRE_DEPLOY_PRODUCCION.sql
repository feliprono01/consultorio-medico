-- ============================================================================
-- Migración manual a ejecutar en la base de datos de PRODUCCIÓN antes de
-- desplegar el código actual del backend.
--
-- Por qué hace falta: ddl-auto=update (Hibernate) crea columnas que faltan,
-- pero nunca modifica el tipo de una columna que ya existe. Varios campos
-- fueron ampliados de VARCHAR a TEXT en el código a lo largo del proyecto
-- (para no truncar texto clínico largo), pero esas columnas en una base ya
-- existente se quedaron en VARCHAR hasta que se corre este ALTER a mano.
-- Esto ya se aplicó en la base de desarrollo (XAMPP); falta en producción.
--
-- Es seguro correr esto aunque alguna columna ya esté en TEXT: MODIFY COLUMN
-- al mismo tipo es una operación sin efecto. Se puede ejecutar completo de
-- una sola vez.
--
-- Hacer un backup/snapshot de la base antes de correrlo, como con cualquier
-- ALTER TABLE en producción.
-- ============================================================================

-- --- evaluaciones_psiquiatricas (19 campos, todos cifrados a nivel de columna) ---
ALTER TABLE evaluaciones_psiquiatricas
    MODIFY COLUMN apariencia            TEXT,
    MODIFY COLUMN conducta              TEXT,
    MODIFY COLUMN lenguaje              TEXT,
    MODIFY COLUMN animo                 TEXT,
    MODIFY COLUMN afecto                TEXT,
    MODIFY COLUMN pensamiento           TEXT,
    MODIFY COLUMN sensopercepcion       TEXT,
    MODIFY COLUMN juicio                TEXT,
    MODIFY COLUMN memoria               TEXT,
    MODIFY COLUMN atencion              TEXT,
    MODIFY COLUMN riesgo_suicida        TEXT,
    MODIFY COLUMN riesgo_homicida       TEXT,
    MODIFY COLUMN conciencia            TEXT,
    MODIFY COLUMN riesgo_propio         TEXT,
    MODIFY COLUMN eje1                  TEXT,
    MODIFY COLUMN eje2                  TEXT,
    MODIFY COLUMN eje3                  TEXT,
    MODIFY COLUMN adherencia_tratamiento TEXT,
    MODIFY COLUMN efectos_adversos      TEXT;

-- --- consultas ---
ALTER TABLE consultas
    MODIFY COLUMN motivo       TEXT NOT NULL,
    MODIFY COLUMN diagnostico  TEXT,
    MODIFY COLUMN tratamiento  TEXT,
    MODIFY COLUMN notas        TEXT;

-- motivo_consulta: campo legacy eliminado de la entidad Java. Si la columna
-- todavía existe en la tabla (ddl-auto=update no la borra), y quedó como
-- NOT NULL de cuando se usaba, hay que liberarla para no romper los INSERT
-- nuevos, que ya no la completan. Si la columna ya no existe, este ALTER
-- falla con error de columna inexistente — en ese caso, ignorar la línea.
ALTER TABLE consultas MODIFY COLUMN motivo_consulta TEXT NULL;

-- --- historias_psiquiatricas ---
ALTER TABLE historias_psiquiatricas
    MODIFY COLUMN antecedentes_familiares    TEXT,
    MODIFY COLUMN antecedentes_personales    TEXT,
    MODIFY COLUMN historia_consumo           TEXT,
    MODIFY COLUMN enfermedad_actual          TEXT,
    MODIFY COLUMN tratamientos_previos       TEXT,
    MODIFY COLUMN desarrollo_psicomotor      TEXT,
    MODIFY COLUMN personalidad_previa        TEXT,
    MODIFY COLUMN antecedentes_psicologicos  TEXT;

-- --- pacientes ---
ALTER TABLE pacientes
    MODIFY COLUMN datos_padres    TEXT,
    MODIFY COLUMN datos_hijos     TEXT,
    MODIFY COLUMN datos_hermanos  TEXT;

-- ============================================================================
-- Verificación posterior: confirmar que no quedó ninguna VARCHAR donde el
-- código espera TEXT.
-- ============================================================================
-- SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_SCHEMA = DATABASE()
--   AND TABLE_NAME IN ('evaluaciones_psiquiatricas', 'consultas', 'historias_psiquiatricas', 'pacientes')
--   AND DATA_TYPE = 'varchar'
--   AND COLUMN_NAME NOT IN ('nombre','apellido','dni','email','telefono','ciudad','direccion','sexo','ocupacion','estado_civil','escolaridad');


-- ============================================================================
-- Auditoría con encadenado de integridad (hash chain) — blindaje legal/judicial
--
-- Agrega las columnas hash/hash_anterior a las dos tablas de auditoría de
-- cambios, y bloquea a nivel de permisos que el usuario de la aplicación
-- pueda modificar o borrar filas ya escritas en esas tablas (ni siquiera con
-- acceso directo a la base). Sin esto, cualquier perito de la contraparte
-- podría cuestionar la validez del historial de auditoría.
--
-- IMPORTANTE: reemplazar 'NOMBRE_USUARIO_APP' y 'HOST_APP' por el usuario y
-- host reales que usa el backend en producción (ver el equivalente a
-- consultorio_user en la base de desarrollo). Correr esto DESPUÉS de que
-- Hibernate (ddl-auto=update) haya creado las columnas nuevas — si todavía
-- no se desplegó el código nuevo, los ALTER TABLE de abajo la crean a mano.
-- ============================================================================

ALTER TABLE consulta_audit_logs
    ADD COLUMN IF NOT EXISTS hash VARCHAR(64),
    ADD COLUMN IF NOT EXISTS hash_anterior VARCHAR(64);

ALTER TABLE historia_psiquiatrica_audit_logs
    ADD COLUMN IF NOT EXISTS hash VARCHAR(64),
    ADD COLUMN IF NOT EXISTS hash_anterior VARCHAR(64);

-- Reemplazar el GRANT amplio por uno sin UPDATE/DELETE a nivel de schema, y
-- otorgar UPDATE/DELETE explícitamente solo en las tablas operativas — NO en
-- consulta_audit_logs, historia_psiquiatrica_audit_logs ni access_logs.
-- (No usar REVOKE UPDATE, DELETE ON <tabla> directo: si el usuario solo tiene
-- un GRANT ALL a nivel de todo el schema, ese REVOKE puntual falla con
-- "no such grant defined" porque no existe una fila de privilegio por tabla.)
REVOKE ALL PRIVILEGES ON NOMBRE_BASE_PRODUCCION.* FROM 'NOMBRE_USUARIO_APP'@'HOST_APP';
GRANT SELECT, INSERT, CREATE, DROP, REFERENCES, INDEX, ALTER ON NOMBRE_BASE_PRODUCCION.* TO 'NOMBRE_USUARIO_APP'@'HOST_APP';
GRANT UPDATE, DELETE ON NOMBRE_BASE_PRODUCCION.consultas TO 'NOMBRE_USUARIO_APP'@'HOST_APP';
GRANT UPDATE, DELETE ON NOMBRE_BASE_PRODUCCION.evaluaciones_psiquiatricas TO 'NOMBRE_USUARIO_APP'@'HOST_APP';
GRANT UPDATE, DELETE ON NOMBRE_BASE_PRODUCCION.historias_psiquiatricas TO 'NOMBRE_USUARIO_APP'@'HOST_APP';
GRANT UPDATE, DELETE ON NOMBRE_BASE_PRODUCCION.pacientes TO 'NOMBRE_USUARIO_APP'@'HOST_APP';
GRANT UPDATE, DELETE ON NOMBRE_BASE_PRODUCCION.usuarios TO 'NOMBRE_USUARIO_APP'@'HOST_APP';
GRANT UPDATE, DELETE ON NOMBRE_BASE_PRODUCCION.revoked_tokens TO 'NOMBRE_USUARIO_APP'@'HOST_APP';
FLUSH PRIVILEGES;

-- Verificación posterior (debe fallar con "command denied"):
--   mysql -u NOMBRE_USUARIO_APP -p NOMBRE_BASE_PRODUCCION \
--     -e "UPDATE consulta_audit_logs SET modificado_por='test' WHERE id=1;"
