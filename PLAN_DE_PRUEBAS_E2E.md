# Plan de Pruebas End-to-End (E2E) y Lista de Control para Producción
## Sistema de Gestión Clínica y Psiquiátrica — Consultorio Médico Profesional

Este documento establece el protocolo formal de pruebas integrales **End-to-End (E2E)** para validar el funcionamiento del sistema en un entorno de pre-producción o staging antes de la entrega final al cliente, así como las recomendaciones y configuraciones críticas de paso a producción.

---

## 🧪 PARTE 1: Plan de Pruebas End-to-End (E2E) — Checklist Operativo

Este plan divide las pruebas en **6 Módulos Críticos**, cubriendo desde la seguridad hasta el cumplimiento legal en Argentina (Ley 25.326 y Ley 26.529).

### 🟢 Módulo 1: Autenticación, Seguridad y Sesiones (Auth & Security)
| ID | Caso de Prueba | Pasos de Ejecución | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **AUTH-01** | Login exitoso de Administrador | 1. Ir al login web o `POST /api/auth/login`<br>2. Ingresar `admin` y la contraseña del `.env`. | Retorna HTTP 200, cookie HttpOnly `jwt_token` y body con `"role": "ADMIN"`. | `[ ]` |
| **AUTH-02** | Protección contra contraseña incorrecta | 1. Intentar login con credenciales inválidas 3 veces consecutivas. | Retorna HTTP 401/403 sin revelar si falló usuario o contraseña. | `[ ]` |
| **AUTH-03** | Protección Anti-Brute Force (Rate Limit) | 1. Realizar más de 5 intentos fallidos desde la misma IP en menos de 1 minuto. | El sistema bloquea temporalmente la IP y retorna HTTP 429 (Too Many Requests). | `[ ]` |
| **AUTH-04** | Acceso protegido a rutas clínicas | 1. Intentar llamar a `GET /api/pacientes` sin token o sin haber iniciado sesión. | Retorna HTTP 401 Unauthorized / bloqueado por Spring Security. | `[ ]` |
| **AUTH-05** | Logout y Revocación de Token | 1. Iniciar sesión.<br>2. Llamar a `POST /api/auth/logout`.<br>3. Intentar usar el token anterior. | El token es revocado (Blacklist) y la cookie se elimina; accesos posteriores devuelven 401. | `[ ]` |

---

### 🟢 Módulo 2: Derechos del Paciente y Consentimiento Informado (Ley 25.326)
| ID | Caso de Prueba | Pasos de Ejecución | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **PAC-01** | Alta de Paciente con Consentimiento | 1. Crear un paciente (`POST /api/pacientes`) enviando `"consentimientoInformado": true`. | El paciente se crea con `consentimientoInformado: true` y la fecha de hoy en `fechaConsentimiento`. | `[ ]` |
| **PAC-02** | Alta sin Consentimiento (Pendiente) | 1. Crear paciente enviando `"consentimientoInformado": false`. | El paciente se guarda con `consentimientoInformado: false` y `fechaConsentimiento: null`. | `[ ]` |
| **PAC-03** | Firma posterior de Consentimiento | 1. Editar el paciente del paso anterior (`PUT /api/pacientes/{id}`) cambiando a `true`. | El sistema actualiza el campo y sella automáticamente la fecha de hoy. | `[ ]` |
| **PAC-04** | Búsqueda por DNI y Nombre | 1. Buscar paciente por DNI exacto (`GET /api/pacientes/dni/{dni}`) y por texto en apellido. | Retorna exactamente el paciente consultado con tiempo de respuesta < 200ms. | `[ ]` |

---

### 🟢 Módulo 3: Cifrado en Reposo de Datos Sensibles (AES-256-GCM)
| ID | Caso de Prueba | Pasos de Ejecución | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **ENC-01** | Guardado de antecedentes familiares | 1. Editar un paciente y guardar en `datosPadres`: `"Antecedentes cardíacos e hipertensión"`. | Vía API el campo se devuelve en texto plano perfectamente legible. | `[ ]` |
| **ENC-02** | Verificación en base de datos MySQL | 1. Conectarse a MySQL (`mysql.exe`) y hacer `SELECT datos_padres FROM pacientes WHERE id=...`. | El campo en MySQL no es legible; empieza con el prefijo `ENC:...` (Base64 + GCM tag). | `[ ]` |
| **ENC-03** | Retrocompatibilidad con texto plano | 1. Insertar manualmente un dato en texto plano (sin `ENC:`) en MySQL.<br>2. Consultar vía API. | El convertidor JPA devuelve el texto sin romper ni lanzar error de desencriptación. | `[ ]` |

---

### 🟢 Módulo 4: Historia Clínica, Consultas y Evoluciones Médicas
| ID | Caso de Prueba | Pasos de Ejecución | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **CONS-01** | Registro de Consulta Médica | 1. Crear una consulta para un paciente (`POST /api/pacientes/{id}/consultas`) con motivo, diagnóstico y tratamiento. | La consulta se asocia correctamente a la ficha del paciente. | `[ ]` |
| **CONS-02** | Registro de Escalas Psiquiátricas | 1. Guardar consulta con métricas de 1 a 10 en estado de ánimo, sueño, sociabilidad y funcionalidad. | Los puntajes se guardan y son legibles para la evolución clínica del paciente. | `[ ]` |
| **CONS-03** | Registro de Historia Psiquiátrica | 1. Asignar o actualizar la Historia Psiquiátrica del paciente (antecedentes familiares/personales). | Se crea una relación 1 a 1 encriptada con el paciente. | `[ ]` |

---

### 🟢 Módulo 5: Exportación Legal a PDF (Ley 26.529 — Derechos del Paciente)
| ID | Caso de Prueba | Pasos de Ejecución | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **PDF-01** | Generación de Historia Clínica en PDF | 1. Solicitar descarga (`GET /api/pacientes/{id}/export-pdf`). | Retorna HTTP 200 con `Content-Type: application/pdf` y un archivo PDF válido (> 10 KB). | `[ ]` |
| **PDF-02** | Validación de Contenido y Foliado | 1. Abrir el PDF exportado y verificar su contenido. | Contiene cabecera institucional, datos del paciente, firma y todas las consultas foliadas cronológicamente. | `[ ]` |
| **PDF-03** | Exportación de paciente sin consultas | 1. Descargar PDF de un paciente recién creado sin consultas. | Genera un PDF válido con la cabecera y datos de filiación, indicando que no posee consultas previas. | `[ ]` |

---

### 🟢 Módulo 6: Auditoría Legal y No Repudio (`Access Logs`)
| ID | Caso de Prueba | Pasos de Ejecución | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **AUD-01** | Registro automático al ver ficha | 1. Con un usuario, llamar a `GET /api/pacientes/{id}`.<br>2. Con el usuario Admin, consultar la tabla `access_logs` (o endpoint `/api/access-logs`). | Aparece un nuevo registro de auditoría con la acción `VER_FICHA`, la fecha/hora exacta y la IP del usuario. | `[ ]` |
| **AUD-02** | Registro automático de consultas | 1. Visualizar una consulta médica o historia psiquiátrica de un paciente. | Se registra la acción correspondiente (`VER_CONSULTA` o `VER_HISTORIA_PSIQUIATRICA`). | `[ ]` |

---
---

## 🛠️ PARTE 2: Inspección Crítica y Sugerencias antes de Pasar a Producción (Cliente)

Antes de instalar o entregar la aplicación en el servidor definitivo del cliente, **te sugiero inspeccionar y realizar los siguientes 6 ajustes clave**:

### 1. 🔒 Secretos y Claves Criptográficas (`.env` de Producción)
* **`JWT_SECRET`:** Reemplazá el secreto de desarrollo por una cadena aleatoria de al menos **64 caracteres hexadecimales/alfanuméricos**. Nunca uses el default en un servidor público.
* **`ENCRYPTION_KEY`:** Definí una clave secreta fuerte de al menos 32 caracteres y **entregale una copia de respaldo segura al cliente (ej. en un pendrive o gestor de contraseñas)**.
  > [!CAUTION]
  > **Advertencia al cliente:** Si el cliente formatea el servidor y pierde la variable `ENCRYPTION_KEY`, **será matemáticamente imposible desencriptar las historias clínicas y antecedentes familiares** guardados en MySQL.

### 2. 🌐 Seguridad HTTP, SSL/TLS y Cookies (`application.properties`)
* **Certificado SSL/TLS (HTTPS):** La legislación sanitaria exige que la transmisión de datos clínicos sea cifrada en tránsito. Instalá un certificado SSL (ej. Let's Encrypt o certificado del host).
* **Cookies Seguras:** Una vez habilitado HTTPS, activá en `application.properties` o variable de entorno:
  ```properties
  jwt.cookie.secure=true
  ```
  *(Esto impide que la cookie se transmita por conexiones HTTP no encriptadas).*
* **CORS estricto (`cors.allowed-origins`):** Modificá los orígenes permitidos para que solo acepten el dominio oficial del cliente (ej. `https://consultorio-drgonzalez.com`) y eliminá los `localhost` de desarrollo.

### 3. 🏥 Personalización Institucional del Membrete PDF (`PdfService.java` / `.env`)
* Inspeccioná el archivo de generación de PDF para asegurarte de que refleje con exactitud la identidad del profesional o consultorio del cliente:
  * **Nombre institucional y subtítulo** (ej. "Consultorio de Psiquiatría y Salud Mental").
  * **Nombre del Profesional Principal y Matrícula (M.N. / M.P.)** que figurarán en el pie de página o encabezado legal de la Historia Clínica.
  * **Dirección física, ciudad y teléfono de contacto**.

### 4. 💾 Rutas de Respaldo Automático (`mysqldump` / Backups)
* El sistema incluye un módulo de respaldo en `BackupController.java` y `BackupService.java`.
* Verificá en el `.env` del servidor del cliente la ruta del ejecutable `mysqldump`:
  * En Windows (XAMPP): `MYSQLDUMP_PATH=C:/xampp/mysql/bin/mysqldump.exe`
  * En Linux (Ubuntu/Debian): `MYSQLDUMP_PATH=/usr/bin/mysqldump`
* Comprobá que la carpeta de destino (`backup.directory=backups`) tenga permisos de escritura para el servicio del sistema operativo.

### 5. ⚡ Compilación del Frontend en Modo Producción (SPA)
* No ejecutes el frontend con `npm run dev` en el servidor del cliente.
* En su lugar, generá el build estático optimizado de React:
  ```powershell
  cd frontend
  npm run build
  ```
* Esto generará una carpeta `frontend/dist/` optimizada, minificada y lista para ser servida por un servidor web de producción como **Nginx**, **Apache**, o integrada dentro de los recursos estáticos de Spring Boot / Docker.

### 6. 🧹 Limpieza de Datos de Prueba (Seeder / `DataLoader.java`)
* En desarrollo existe el usuario `admin`. Antes de entregar al cliente:
  1. Iniciá sesión como Administrador en producción.
  2. **Creá la cuenta personal del Médico y la cuenta real de Administración** con contraseñas robustas.
  3. Si lo deseás, cambiá la contraseña del `admin` por defecto o desactivala una vez creados los administradores definitivos de la clínica.
