# Guía de Despliegue en PC de Cliente (On-Premise)

Esta guía detalla cómo instalar y ejecutar el sistema `Consultorio Medico` en la computadora de un cliente final.

## Estrategia Recomendada: "Todo en Uno" (Single JAR)
Para simplificar la instalación, empaquetaremos el Frontend (React) **DENTRO** del Backend (Spring Boot).
*   **Ventaja**: El cliente NO necesita instalar Node.js ni configurar servidores web complejos.
*   **Requisito**: Solo necesita Java y MySQL.

---

## Paso 1: Preparar la PC del Cliente

### 1. Instalar Base de Datos (MySQL)
Lo más fácil es instalar **XAMPP** (igual que en tu desarrollo) o **MySQL Server Community**.
1.  Instalar XAMPP.
2.  Iniciar servicio MySQL.
3.  Entrar a phpMyAdmin (o consola) y crear la base de datos vacía:
    ```sql
    CREATE DATABASE consultorio_medico;
    ```
    *(No necesitas tablas, el sistema las crea o valida al iniciar, aunque es mejor llevar un dump inicial si tienes datos base).*

### 2. Instalar Java
1.  Descargar e instalar **OpenJDK 17 (JRE o JDK)**. (Recomendado: Eclipse Temurin 17 LTS).
2.  Verificar en su terminal con `java -version`.

---

## Paso 2: Crear el Ejecutable Final (En TU PC)

Vamos a integrar el frontend en el backend.

1.  **Construir Frontend**:
    Desde la carpeta `frontend`:
    ```powershell
    npm run build
    ```
    (Esto actualiza la carpeta `dist`).

2.  **Mover Frontend al Backend**:
    Copia **todo el contenido** de la carpeta `frontend/dist` y pégalo dentro de:
    `src/main/resources/static`
    *(Nota: Si la carpeta `static` no existe, créala. Si tiene cosas, bórralas antes de pegar).*

    > Spring Boot sirve automáticamente lo que esté en `static` en la raíz `/`.

3.  **Compilar Backend**:
    Desde la raíz del proyecto (donde está el `pom.xml`):
    ```powershell
    mvn clean package -DskipTests
    ```
    Esto generará un nuevo `.jar` en la carpeta `target/`.

---

## Paso 3: Instalación en el Cliente

1.  Crea una carpeta en la PC del cliente, ej: `C:\ConsultorioMedico`.
2.  Copia el archivo `.jar` generado (ej: `consultorio-medico-1.0.0.jar`) a esa carpeta.
3.  Crea un archivo de inicio **`iniciar_sistema.bat`** en esa carpeta con este contenido:

    ```batch
    @echo off
    title Servidor Consultorio Medico
    echo Iniciando sistema...
    
    :: Configuración de Base de Datos del Cliente
    set DB_URL=jdbc:mysql://localhost:3306/consultorio_medico?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    set DB_USER=root
    set DB_PASSWORD=
    
    :: Configuración de Email (Gmail)
    :: El cliente debe generar una "Contraseña de Aplicación" en su cuenta de Google
    set MAIL_USER=tu_consultorio@gmail.com
    set MAIL_PASSWORD=xxxx xxxx xxxx xxxx
    set MAIL_TO=doctor@gmail.com
    
    :: Clave de seguridad
    set JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
    
    :: Iniciar
    java -Dspring.profiles.active=prod ^
         -Dspring.datasource.url="%DB_URL%" ^
         -Dspring.datasource.username="%DB_USER%" ^
         -Dspring.datasource.password="%DB_PASSWORD%" ^
         -Dspring.mail.username="%MAIL_USER%" ^
         -Dspring.mail.password="%MAIL_PASSWORD%" ^
         -Dbackup.email.to="%MAIL_TO%" ^
         -jar consultorio-medico-1.0.0.jar
    pause
    ```
    *(Nota: Explicar al cliente cómo obtener su "Contraseña de Aplicación" de Google).*

---

## Paso 4: Uso

1.  El cliente hace doble clic en `iniciar_sistema.bat`.
2.  Se abre la ventana negra (consola) y espera a que diga "Started...".
3.  El cliente abre su navegador (Chrome/Edge) y va a:
    **`http://localhost:8080`**
    (Nota: Ya no es puerto 3000, porque ahora todo lo sirve Java en el 8080).

---

## Resumen de Archivos a Entregar
Solo necesitas copiar a la PC del cliente:
1.  El archivo `.jar` final.
2.  El script `.bat`.
