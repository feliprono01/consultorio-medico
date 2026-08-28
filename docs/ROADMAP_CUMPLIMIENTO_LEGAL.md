# Roadmap de Cumplimiento Legal y Seguridad
**Proyecto:** Consultorio Médico API
**Objetivo:** Alcanzar el cumplimiento normativo total con la Ley 25.326 (Protección de Datos Personales) y la Ley 26.529 (Derechos del Paciente y de la Historia Clínica) en Argentina.

Este documento detalla las funcionalidades pendientes a implementar en el sistema, divididas en fases según su prioridad legal y complejidad técnica.

---

## 🟢 Fase 1: Derechos Fundamentales del Paciente
**Prioridad:** Alta (Corto Plazo)
**Motivo:** Son los requisitos más visibles y solicitados por la ley. Protegen al médico de reclamos inmediatos (falta de consentimiento o negación de acceso a la historia clínica).

### 1.1 Registro de Consentimiento Informado
*   **Descripción:** La ley prohíbe el tratamiento de datos sensibles de salud sin consentimiento expreso.
*   **Tareas de Backend (Spring Boot):**
    *   Agregar campo `booleano` `consentimientoInformado` en la entidad `Paciente`.
    *   Agregar campo `fechaConsentimiento` (`LocalDate`).
    *   (Opcional pero ideal) Crear un endpoint para subir un archivo escaneado/foto del documento físico firmado por el paciente.
*   **Tareas de Frontend:**
    *   Agregar un "Checkbox" obligatorio en el formulario de alta/edición del paciente.

### 1.2 Exportación de Historia Clínica (Derecho de Portabilidad)
*   **Descripción:** El paciente tiene derecho a pedir copia de su HC y debe entregarse en 48hs.
*   **Tareas de Backend:**
    *   Agregar dependencia para generación de PDF (ej. `OpenPDF` o `Apache PDFBox`).
    *   Crear un endpoint `GET /api/pacientes/{id}/historia-clinica/exportar` que genere un PDF ordenado cronológicamente con todas las consultas y datos del paciente.
    *   Garantizar que el PDF sea de solo lectura e incluya los metadatos de auditoría (quién lo generó y cuándo).
*   **Tareas de Frontend:**
    *   Botón "Descargar Historia Clínica (PDF)" en el perfil del paciente.

---

## 🟡 Fase 2: Seguridad Avanzada de Datos (Cifrado en Reposo)
**Prioridad:** Media (Mediano Plazo)
**Motivo:** Aunque el sistema ya tiene autenticación, auditoría y backups encriptados, si la base de datos es comprometida, los datos crudos serían legibles.

### 2.1 Encriptación de Campos Sensibles en Base de Datos
*   **Descripción:** Cifrar la información médica a nivel de aplicación antes de guardarla en la tabla.
*   **Tareas de Backend:**
    *   Implementar convertidores de JPA (`AttributeConverter<String, String>`).
    *   Utilizar un algoritmo fuerte (ej. `AES-256-GCM`) con una clave secreta almacenada en las variables de entorno (`.env`).
    *   Aplicar la anotación `@Convert` en campos de alto riesgo: 
        *   `Paciente`: `datosPadres`, `datosHijos`, `datosHermanos`.
        *   `Consulta`: `diagnostico`, `tratamiento`, `notas`, `motivo_consulta`.
        *   Todo el registro de `HistoriaPsiquiatrica`.
*   **Consideraciones:** Afectará la forma en que se realizan las búsquedas en la base de datos (no se podrá usar `LIKE` o buscar palabras clave en texto encriptado directamente desde SQL).

---

## 🔴 Fase 3: Validez Legal Absoluta y No Repudio (Firma Digital)
**Prioridad:** Baja (Largo Plazo / Opcional para 1 solo médico)
**Motivo:** Es técnicamente el paso más complejo. Pasa de ser un sistema de "Firma Electrónica" (usuario y contraseña) a uno con plena equivalencia jurídica al papel.

### 3.1 Integración con Token USB (PKCS#11)
*   **Descripción:** Firmar digitalmente cada consulta utilizando el Token USB del profesional médico.
*   **Tareas de Backend:**
    *   Integrar la librería `BouncyCastle`.
    *   Crear funcionalidad para generar un "Hash" (SHA-256) del JSON o PDF de la consulta terminada.
    *   Crear un endpoint para recibir la Firma Digital firmada y validar la cadena de confianza del certificado (verificar que no esté revocado y sea de una autoridad válida).
    *   Almacenar la firma (`byte[]`) y el certificado público en la tabla de `Consulta`.
*   **Tareas de Frontend y Cliente Local:**
    *   Adaptar el Frontend para que se comunique mediante WebSocket o llamadas HTTP locales con un "Agente Firmador" instalado en Windows.
    *   Configurar el Agente Firmador para que se comunique con el Token USB, pida el PIN y devuelva el Hash firmado.

---

*Documento generado como hoja de ruta para futuras iteraciones del proyecto Consultorio Médico.*
