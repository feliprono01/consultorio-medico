# Roadmap de Cumplimiento Legal y Seguridad
**Proyecto:** PsiClínica
**Objetivo:** Cumplimiento con la Ley 25.326 (Protección de Datos Personales) y la Ley 26.529 (Derechos del Paciente y de la Historia Clínica) en Argentina.

Actualizado 28/08/2026 — Fase 1 y Fase 2 ya están implementadas, y se sumó una capa
completa de auditoría con validez legal que no estaba contemplada cuando se escribió la
primera versión de este roadmap.

---

## ✅ Fase 1: Derechos Fundamentales del Paciente — completa

### 1.1 Consentimiento Informado
Implementado: `Paciente.consentimientoInformado` (booleano) + `fechaConsentimiento`,
sellada automáticamente al marcarlo. Checkbox en el alta/edición del paciente.

### 1.2 Exportación de Historia Clínica (Derecho de Portabilidad — Art. 19/20 Ley 26.529)
Implementado: `GET /api/pacientes/{id}/historia-clinica/exportar` genera un PDF completo
y ordenado cronológicamente (OpenPDF), con metadatos de quién y cuándo lo generó impresos
en cada página, y un **código de verificación corto** que permite rastrear esa
exportación puntual en `/api/access-logs/paciente/{id}` si alguna vez se cuestiona la
autenticidad de una copia entregada.

---

## ✅ Fase 2: Cifrado en Reposo — completa

Todos los campos clínicos sensibles (`Paciente`, `HistoriaPsiquiatrica`, `Consulta`,
`EvaluacionPsiquiatrica`, y las tablas de auditoría) están cifrados a nivel de columna
con AES-256-GCM (`AttributeEncryptor`, clave en `.env`/variables de entorno del
servidor). Un acceso directo a la base sin la clave no revela contenido clínico legible.

---

## ✅ Fase 2.5: Auditoría con validez legal — completa (no estaba en el roadmap original)

Surgió de una pregunta concreta: si la justicia pide demostrar que el historial de
cambios de una consulta no fue alterado, ¿con qué se cuenta? Se implementó:

- **Bloqueo de permisos a nivel de base de datos**: el usuario de la aplicación no puede
  `UPDATE`/`DELETE` las tablas de auditoría (`consulta_audit_logs`,
  `historia_psiquiatrica_audit_logs`, `access_logs`), ni con acceso directo a MySQL.
- **Cadena de hashes (tamper-evidence)**: cada fila de auditoría encadena su hash con el
  de la fila anterior — alterar un registro, aunque sea directo en la base, rompe la
  cadena de ahí en adelante de forma matemáticamente detectable. Verificable en
  `GET /api/consultas/auditoria/verificar-cadena` (solo ADMIN).
- **Auditoría de acciones administrativas** (`general_log` de MySQL) + una cuenta de
  administración nombrada (no compartir la de `root`), para que quede registro de quién
  hizo qué incluso a nivel de base de datos.
- **Verificación automática periódica** (cada 6hs) con alerta por mail si alguna cadena
  deja de estar intacta.
- **Backups automáticos diarios**, cifrados (AES-256), enviados por mail fuera del
  servidor — una copia independiente contra la que comparar si alguna vez se sospecha de
  una alteración que haya logrado pasar desapercibida en el propio servidor.

---

## ✅ Fase 2.6: Registros inalterables + campos faltantes — completa

Surgió de auditar la app contra `anexo/Requerimientos_HCE_Psiquiatrica_Argentina.pdf`
(guía de cumplimiento Argentina: leyes 26.529, 27.706, 26.657, 25.326, 25.506). Se
encontraron brechas reales y se cerraron:

- **Modelo append-only real para `Consulta`** (Ley 26.657 — una evolución ya firmada no
  se altera nunca). Corregir una consulta ya no hace `UPDATE` sobre la fila existente:
  crea una fila nueva completa que referencia a la anterior vía `correccionDeId`
  (`POST /api/consultas/{id}/corregir`). La fila original queda intacta para siempre —
  verificable directamente en la base. La cadena completa de versiones de una consulta
  se puede recorrer con `GET /api/consultas/{id}/versiones`. El hash-chain de auditoría
  existente (Fase 2.5) no se tocó — sigue protegiendo el detalle de qué cambió en cada
  corrección. `HistoriaPsiquiatrica` (el perfil de base del paciente, no una nota de
  sesión firmada) sigue editable como antes, con su protección de hash-chain propia.
- **Riesgo cierto e inminente fundamentado** (Ley 26.657, arts. 20/21): los tres campos
  de riesgo (suicida, heteroagresivo, autocuidado) pasan a ser obligatorios en cada
  consulta, y cuando el nivel marcado es Alto/Inminente/Grave, la app exige una
  "Fundamentación técnica del riesgo" — tanto en el frontend como con una validación de
  respaldo en el backend (`ConsultaService.validarFundamentacionRiesgo`, rechaza con 400
  y mensaje claro si falta).
- **Directivas Anticipadas en Salud Mental** (Ley 26.657, art. 7 inc. n): campo nuevo en
  `HistoriaPsiquiatrica`, cifrado como el resto de los antecedentes.
- **Datos administrativos del paciente**: CUIL/CUIT, obra social, N° de afiliado, y
  contacto de emergencia (nombre + teléfono) — campos habituales en cualquier HCE
  formal que faltaban.
- **Diagnóstico codificado** (`diagnosticoCie10`): campo de texto junto al diagnóstico
  libre para anotar el código CIE-10 correspondiente, sin buscador de terminología.
- **Medicación estructurada, más completa**: se sumaron vía de administración y
  duración prevista a cada fármaco recetado (fármaco/dosis/frecuencia ya existían de una
  ronda anterior).

---

## 🟡 Fase 3: Firma Digital (Ley 25.506) — opcional, no requerida hoy

**Conclusión para un consultorio de uno o pocos profesionales:** la firma física
(lapicera + sello con matrícula — el membrete del PDF de Historia Clínica ya imprime la
matrícula configurada) sobre la copia impresa es el método estándar y legalmente
suficiente en Argentina para esta escala. Una firma digital con equivalencia jurídica
plena (Ley 25.506, token USB con certificado de una autoridad certificante) es una mejora
real pero de complejidad considerable, y no es un requisito pendiente — queda documentada
acá como posibilidad para el futuro, no como brecha a cerrar.

### 3.1 Si en algún momento se decide implementarla: Integración con Token USB (PKCS#11)
*   Integrar la librería `BouncyCastle`.
*   Generar un hash (SHA-256) del JSON o PDF de la consulta terminada.
*   Endpoint para recibir la firma digital y validar la cadena de confianza del
    certificado (no revocado, autoridad certificante válida).
*   Guardar la firma (`byte[]`) y el certificado público en `Consulta`.
*   Frontend + un "Agente Firmador" local en Windows que hable con el token USB, pida el
    PIN, y devuelva el hash firmado.

---

## 🔴 Brechas conocidas y deliberadas — no implementadas, y por qué

A diferencia de todo lo anterior, esto no quedó afuera por descuido: se evaluó, se
decidió no implementarlo ahora, y se deja anotado para que quede claro que es una
decisión y no un olvido.

- **HL7 FHIR / SNOMED-CT (Ley 27.706 — Historia Clínica Electrónica Interoperable)**:
  desproporcionado para un consultorio de un solo profesional que hoy no necesita
  interoperar con otro sistema de salud. Adoptar un estándar de interoperabilidad
  completo (recursos FHIR, terminología SNOMED-CT) tiene sentido si en el futuro la app
  necesita intercambiar historia clínica con una obra social, un hospital, u otro
  sistema — no antes.
- **Rol RBAC "Administrativo"** (personal de recepción/turnos sin acceso a notas
  clínicas): hoy todos los usuarios con cuenta tienen el mismo rol de acceso clínico
  completo. Separar un rol sin acceso a contenido clínico es una mejora real de
  minimización de accesos, pero no se implementó en esta pasada por tamaño — queda como
  siguiente paso si se suma personal no clínico al sistema.
- **Timestamp certificado por una autoridad externa (RFC 3161)** en los logs de
  auditoría: el hash-chain actual (Fase 2.5) prueba que un registro no fue alterado
  *después* de escrito, pero la fecha de esa escritura depende del reloj del propio
  servidor. Un timestamp sellado por un tercero (una Autoridad de Sellado de Tiempo)
  agregaría prueba independiente de *cuándo* se escribió, no solo de que no se tocó
  después — mejora real, pero de complejidad e integración externa que no se justifica
  hoy para la escala del proyecto.

---

*Documento vivo — actualizar cuando cambie el estado de cumplimiento.*
