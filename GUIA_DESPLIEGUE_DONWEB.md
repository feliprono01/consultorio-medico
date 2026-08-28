# Guía de Despliegue — HCP SYSTEM en DonWeb

Plan paso a paso para llevar el sistema (hasta ahora corriendo solo en local, con XAMPP)
a un servidor real en DonWeb, accesible desde cualquier lado.

**Decisiones ya tomadas** (28/08/2026):
- Proveedor: **DonWeb** — Cloud Server, 2 vCPU / 2 GB RAM mínimo, Linux (Ubuntu LTS).
- Método de despliegue: **Docker Compose** (`docker-compose.yml`, ya en el repo).
- Base de datos de producción: **arranca vacía**, sin migrar los pacientes de prueba ni
  los datos actuales de la PC de desarrollo.
- Dominio: **no hay todavía** — se accede por IP mientras tanto. Sin dominio no hay
  HTTPS (Let's Encrypt lo necesita), así que el tráfico viaja sin encriptar hasta que
  se sume uno — ver nota de seguridad en el Paso 7.

---

## Parte 1 — Contratar el servidor (lo hace el usuario, no se puede delegar)

1. Entrar a [donweb.com/es-ar/hosting-cloud-servers-vps](https://donweb.com/es-ar/hosting-cloud-servers-vps).
2. Configurar un Cloud Server: **2 vCPU / 2 GB RAM** como mínimo (el propio DonWeb lo
   recomienda para "paneles/apps web"; si el presupuesto da, ir a 4GB RAM da más margen).
3. Sistema operativo: **Linux — Ubuntu** (la LTS más reciente disponible). No usar
   Windows: es más pesado y más caro, y todo lo que armamos (Docker, scripts) está
   pensado para Linux.
4. Completar la compra. DonWeb entrega:
   - Una **IP pública** fija del servidor.
   - Credenciales de acceso — usuario `root` + contraseña, o clave SSH, según cómo se
     configure el servidor al crearlo.
5. Guardar la IP y las credenciales en un lugar seguro (gestor de contraseñas). **No
   compartir la contraseña de root por chat/mail sin necesidad** — si se comparte acá
   para que Claude ayude a configurar, cambiarla apenas termine el despliegue.

---

## Parte 2 — Preparar el servidor

Conectarse por SSH desde una terminal (PowerShell sirve):

```powershell
ssh root@IP_DEL_SERVIDOR
```

### 2.1 Actualizar el sistema

```bash
apt update && apt upgrade -y
```

### 2.2 Instalar Docker y Docker Compose

```bash
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
docker --version
docker compose version
```

### 2.3 Firewall — dejar abierto solo lo necesario

```bash
apt install -y ufw
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP (frontend)
# Puerto 8080 (backend) NO se abre al público — el frontend le habla
# internamente dentro de la red de Docker, no hace falta exponerlo.
ufw enable
```

---

## Parte 3 — Traer el proyecto al servidor

### 3.1 Clonar el repositorio

```bash
cd /opt
git clone https://github.com/feliprono01/consultorio-medico.git hcp-system
cd hcp-system
```

### 3.2 Armar el `.env` de producción

**No reusar los valores del `.env` de desarrollo** — son distintos por diseño (contraseñas,
claves, todo nuevo para el entorno real). Copiar `.env.example` como base:

```bash
cp .env.example .env
nano .env
```

Completar (generar valores nuevos y random para cada uno — no reciclar los de la PC de dev):

| Variable | Qué va |
|---|---|
| `DB_PASSWORD` | Contraseña nueva y fuerte para el usuario root de MySQL en el contenedor |
| `DB_USER` | `consultorio_user` (o el nombre que se prefiera) |
| `DB_USER_PASSWORD` | Contraseña nueva y fuerte, distinta a `DB_PASSWORD` |
| `JWT_SECRET` | Cadena random larga (ej. `openssl rand -hex 64`) |
| `JWT_EXPIRATION` | `86400000` (24hs, o el valor que se prefiera) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credenciales del primer admin real |
| `SPRING_MAIL_USERNAME` / `SPRING_MAIL_PASSWORD` | Cuenta de Gmail + contraseña de aplicación (**sin espacios**, ver nota abajo) para el envío de backups |
| `BACKUP_EMAIL_TO` | A dónde llegan los backups |
| `BACKUP_ZIP_PASSWORD` | Contraseña nueva y fuerte para el ZIP de los backups |
| `ENCRYPTION_KEY` | Clave AES-256 nueva (32 bytes) — generar con `openssl rand -base64 32`. **Una vez que se empiece a cargar pacientes reales, esta clave NUNCA se cambia** (si se pierde o cambia, todos los datos cifrados quedan ilegibles para siempre) |
| `CORS_ALLOWED_ORIGINS` | `http://IP_DEL_SERVIDOR` (actualizar cuando haya dominio) |

> **Nota sobre `SPRING_MAIL_PASSWORD`**: tiene que ser una contraseña de aplicación de
> Gmail (myaccount.google.com → Seguridad → Verificación en 2 pasos → Contraseñas de
> aplicación) **pegada sin los espacios** que Google muestra al generarla — con espacios
> falla la autenticación SMTP (nos pasó en desarrollo, ver commit `cc54841`... el fix real
> fue sacar los espacios de la clave, no un bug de código).

### 3.3 Aplicar el script de blindaje de auditoría

Antes de levantar la app por primera vez, no hace falta correr `PRE_DEPLOY_PRODUCCION.sql`
(la base arranca vacía y las columnas/permisos se aplican solos). **Sí hay que correrlo
igual una vez que el contenedor de MySQL esté arriba**, para bloquear los permisos del
usuario de la app sobre las tablas de auditoría — ver Parte 4, paso 4.3.

---

## Parte 4 — Levantar todo

### 4.1 Build y arranque

```bash
docker compose up -d --build
```

Esto levanta 3 contenedores: `consultorio_db` (MySQL), `consultorio_backend` (Spring
Boot), `consultorio_frontend` (React servido por nginx).

### 4.2 Verificar que todo esté sano

```bash
docker compose ps
docker compose logs -f backend
```

Esperar a ver `Started ConsultorioMedicoApplication` en los logs, y que `docker compose ps`
muestre los 3 contenedores como `healthy`/`running`.

### 4.3 Bloquear permisos de auditoría (una sola vez)

Conectarse a la base dentro del contenedor:

```bash
docker exec -it consultorio_db mysql -u root -p
```

Correr el bloque de `REVOKE`/`GRANT` de `PRE_DEPLOY_PRODUCCION.sql` (sección "Auditoría
con encadenado de integridad"), reemplazando `NOMBRE_USUARIO_APP`/`HOST_APP` por el
usuario real (`DB_USER` del `.env`) y `%` como host (dentro de Docker no es `localhost`).

### 4.4 Crear el primer usuario admin (si no se crea solo)

El backend crea el admin inicial automáticamente usando `ADMIN_USERNAME`/`ADMIN_PASSWORD`
del `.env` si no existe ningún usuario — confirmar entrando a `http://IP_DEL_SERVIDOR`
con esas credenciales.

---

## Parte 5 — Verificación final

Mismo criterio que se usó en desarrollo esta noche, ahora contra el servidor real:

- [ ] Login funciona con las credenciales de `ADMIN_USERNAME`/`ADMIN_PASSWORD`.
- [ ] Crear un paciente de prueba, confirmar que se guarda y se ve en el listado.
- [ ] Disparar un backup manual desde el panel de Admin → Backups, confirmar que el
      mail llega.
- [ ] `GET /api/consultas/auditoria/verificar-cadena` (logueado como admin) devuelve
      `intacta: true`.
- [ ] Intentar `UPDATE` directo sobre `consulta_audit_logs` con el usuario de la app
      (`DB_USER`) y confirmar que da error de permisos.
- [ ] Borrar el paciente de prueba una vez confirmado todo.

---

## Parte 6 — Pendiente para más adelante

- **Dominio + HTTPS**: en cuanto se consiga un dominio, apuntarlo a la IP del servidor
  (registro DNS tipo `A`) y configurar un proxy con certificado automático — la opción
  más simple es [Caddy](https://caddyserver.com/) (certificados Let's Encrypt solos,
  sin configuración manual) delante del contenedor de frontend. Actualizar también
  `CORS_ALLOWED_ORIGINS` en el `.env` al dominio nuevo.
- **Acceso remoto ocasional sin exponer todo a internet**: si en algún momento se
  prefiere no tener el servidor abierto al público 24/7, la alternativa es volver al
  esquema "local + VPN" con Tailscale o Cloudflare Tunnel — quedó descartado por ahora
  porque se priorizó tener el sistema siempre accesible por IP/dominio.
- **Backups fuera del servidor**: hoy los backups salen por mail (ya es una copia
  externa), pero si el volumen de datos crece, considerar además subirlos a un storage
  externo (ver opciones "Nivel 2" charladas en la sesión de blindaje de auditoría).
