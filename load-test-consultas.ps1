# Script para crear 3 consultas de prueba

# 1. Obtener token
$loginBody = '{"username":"admin","password":"admin"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

Write-Host "Token obtenido" -ForegroundColor Green

# 2. Obtener pacientes
$pacientes = Invoke-RestMethod -Uri "http://localhost:8080/api/pacientes" -Method GET -Headers $headers
Write-Host "Pacientes disponibles: $($pacientes.Count)" -ForegroundColor Green

if ($pacientes.Count -lt 3) {
    Write-Host "ERROR: Se necesitan al menos 3 pacientes en la base de datos" -ForegroundColor Red
    exit
}

# 3. Crear consultas (valores numericos del 1-10 para escalas)
Write-Host "`nCreando consultas..." -ForegroundColor Cyan

$consulta1 = @"
{
  "pacienteId": $($pacientes[0].id),
  "motivo": "Primera consulta - Evaluacion inicial",
  "diagnostico": "F32.1 - Episodio depresivo moderado",
  "tratamiento": "Sertralina 50mg/dia - Terapia cognitivo-conductual semanal",
  "notas": "Paciente refiere sintomatologia depresiva de 3 meses. Insomnio de conciliacion. Sin ideas de muerte actuales. Buen insight.",
  "estadoAnimo": 3,
  "calidadSueno":  2,
  "alimentacion": 4,
  "sociabilidad": 3,
  "funcionalidadLaboral": 4,
  "funcionalidadSocial": 3,
  "funcionalidadFamiliar": 6
}
"@

$consulta2 = @"
{
  "pacienteId": $($pacientes[1].id),
  "motivo": "Control - Crisis de panico",
  "diagnostico": "F41.0 - Trastorno de panico sin agorafobia",
  "tratamiento": "Alprazolam 0.5mg SOS maximo 2 por dia - Clonazepam 0.5mg/noche",
  "notas": "Paciente refiere 2 crisis en la ultima semana. Mejoria parcial con benzodiacepinas. Se refuerzan tecnicas de manejo.",
  "estadoAnimo": 4,
  "calidadSueno": 5,
  "alimentacion": 6,
  "sociabilidad": 4,
  "funcionalidadLaboral": 5,
  "funcionalidadSocial": 4,
  "funcionalidadFamiliar": 7
}
"@

$consulta3 = @"
{
  "pacienteId": $($pacientes[2].id),
  "motivo": "Insomnio cronico - Derivacion de medico clinico",
  "diagnostico": "F51.0 - Insomnio no organico",
  "tratamiento": "Higiene del sueno - Trazodona 50mg/noche - Restriccion de tiempo en cama",
  "notas": "Paciente con insomnio de 6 meses. Latencia mayor a 2 horas. Multiples despertares. Descartada apnea del sueno.",
  "estadoAnimo": 7,
  "calidadSueno": 2,
  "alimentacion": 7,
  "sociabilidad": 7,
  "funcionalidadLaboral": 5,
  "funcionalidadSocial": 7,
  "funcionalidadFamiliar": 8
}
"@

try {
    $r1 = Invoke-RestMethod -Uri "http://localhost:8080/api/consultas" -Method POST -Headers $headers -Body $consulta1
    Write-Host "Consulta 1 creada exitosamente (ID: $($r1.id)) - Paciente: $($pacientes[0].nombre) $($pacientes[0].apellido)" -ForegroundColor Green
    Write-Host "  Motivo: Primera consulta - Evaluacion inicial" -ForegroundColor Gray
}
catch {
    Write-Host "Error en consulta 1: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $r2 = Invoke-RestMethod -Uri "http://localhost:8080/api/consultas" -Method POST -Headers $headers -Body $consulta2
    Write-Host "Consulta 2 creada exitosamente (ID: $($r2.id)) - Paciente: $($pacientes[1].nombre) $($pacientes[1].apellido)" -ForegroundColor Green
    Write-Host "  Motivo: Control - Crisis de panico" -ForegroundColor Gray
}
catch {
    Write-Host "Error en consulta 2: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $r3 = Invoke-RestMethod -Uri "http://localhost:8080/api/consultas" -Method POST -Headers $headers -Body $consulta3
    Write-Host "Consulta 3 creada exitosamente (ID: $($r3.id)) - Paciente: $($pacientes[2].nombre) $($pacientes[2].apellido)" -ForegroundColor Green
    Write-Host "  Motivo: Insomnio cronico" -ForegroundColor Gray
}
catch {
    Write-Host "Error en consulta 3: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "3 consultas creadas con informacion de auditoria (createdBy = admin)" -ForegroundColor Green
Write-Host "Puedes verlas en: http://localhost:3003" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "Para probar el historial de cambios:" -ForegroundColor Yellow
Write-Host "  1. Abre una consulta" -ForegroundColor Yellow
Write-Host "  2. Edita el diagnostico o tratamiento" -ForegroundColor Yellow
Write-Host "  3. Haz clic en el boton '🕒 Ver Historial'" -ForegroundColor Yellow
