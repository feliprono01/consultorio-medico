# Script para simular el entorno de produccion localmente

Write-Host "Configurando variables de entorno para Produccion (Simulacion Local)..."

# Limpiar cualquier valor previo de DB_PASSWORD para evitar conflictos
Remove-Item Env:\DB_PASSWORD -ErrorAction SilentlyContinue

# 1. Base de Datos
$env:DB_URL = "jdbc:mysql://localhost:3306/consultorio_medico?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
$env:DB_USER = "root"
# NO establecemos DB_PASSWORD como variable de entorno.

# 2. Seguridad
$env:JWT_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"

# 3. CORS
$env:CORS_ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:3002,http://localhost:5173"

Write-Host "Iniciando Backend en modo PRODUCCION..."
Write-Host "Usa Ctrl+C para detener."
Write-Host "Nota: Se fuerza spring.datasource.password vacia para compatibilidad con XAMPP."

# Ejecutar el JAR con el perfil 'prod'
# Agregamos -Dspring.datasource.password= para sobreescribir cualquier configuracion y asegurar pass vacia
java "-Dspring.profiles.active=prod" "-Dspring.datasource.password=" -jar target/consultorio-medico-1.0.0.jar
