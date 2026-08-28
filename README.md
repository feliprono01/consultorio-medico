# PsiClínica

Sistema de gestión de consultorio psiquiátrico: pacientes, historia clínica, consultas,
evolución del tratamiento y auditoría de cambios con validez legal. Pensado para un
consultorio de un solo profesional (o unos pocos), no para uso multi-tenant.

Backend en Spring Boot (Java 17) + MySQL, frontend en React (Vite). Los datos clínicos
sensibles se guardan cifrados en la base (AES-256-GCM), y cada cambio a un registro
clínico queda auditado con una cadena de hashes verificable — pensado para poder
demostrar ante la justicia que el historial de cambios no fue alterado.

## Correr en desarrollo

Requiere Java 17, Node 18+, y una base MySQL corriendo localmente (XAMPP o similar) con
las variables de `.env` configuradas (ver `.env.example`).

```bash
# Backend (puerto 8080)
./mvnw spring-boot:run

# Frontend (puerto 3002 en dev)
cd frontend
npm install
npm run dev
```

## Documentación

- [`docs/MANUAL_DE_USUARIO.md`](docs/MANUAL_DE_USUARIO.md) — cómo usar la app día a día.
- [`docs/GUIA_DESPLIEGUE_DONWEB.md`](docs/GUIA_DESPLIEGUE_DONWEB.md) — cómo llevar el
  sistema a producción (servidor DonWeb + Docker Compose + dominio/HTTPS).
- [`docs/PLAN_DE_PRUEBAS_E2E.md`](docs/PLAN_DE_PRUEBAS_E2E.md) — checklist técnico de
  verificación (API/curl) antes de cada despliegue.
- [`docs/ROADMAP_CUMPLIMIENTO_LEGAL.md`](docs/ROADMAP_CUMPLIMIENTO_LEGAL.md) — qué exige
  la Ley 25.326/26.529 y qué de eso ya está cubierto.

## Scripts

Todo en [`scripts/`](scripts/): `PRE_DEPLOY_PRODUCCION.sql` (migraciones y permisos para
aplicar en una base de producción ya existente), `create-admin.sql` (crear un admin a
mano si hace falta), `load-test-consultas.*` y `test-data.sql` (datos de prueba para
desarrollo), `run_prod_local.ps1` (levantar el backend en modo producción, en esta misma
PC, cargando `.env`).

## Despliegue

Ver [`docs/GUIA_DESPLIEGUE_DONWEB.md`](docs/GUIA_DESPLIEGUE_DONWEB.md) para el plan
completo. En resumen: `docker-compose.yml` levanta base de datos, backend y frontend en
tres contenedores separados, con límites de recursos y healthchecks ya configurados.
