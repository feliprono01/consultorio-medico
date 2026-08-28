# Script para iniciar el entorno de produccion localmente cargando variables desde el archivo .env

Write-Host "Cargando variables de entorno desde .env..."

# Buscar archivo .env
$envFile = "$PSScriptRoot\.env"
if (-Not (Test-Path $envFile)) {
    Write-Host "No se encontró el archivo .env. Por favor, crea uno basándote en .env.example." -ForegroundColor Red
    exit 1
}

# Leer el archivo línea por línea y parsear las variables
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    # Ignorar líneas vacías o comentarios
    if ($line -ne "" -and -not $line.StartsWith("#")) {
        # Extraer hasta el primer comentario inline (#) si existe
        if ($line -match "^([^#]+)") {
            $cleanedLine = $matches[1].Trim()
            if ($cleanedLine -match "^([^=]+)=(.*)$") {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Setear la variable de entorno
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
                Write-Host "Cargada variable: $key"
            }
        }
    }
}

Write-Host ""
Write-Host "Iniciando Backend..."
Write-Host "Usa Ctrl+C para detener."
Write-Host ""

# Ejecutar el proyecto usando Maven (sin hardcodear el JAR) para que auto-detecte cambios
.\mvnw spring-boot:run
