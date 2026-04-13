# Sistema de Gestión de Consultorios Médicos - Backend

Backend para un Sistema de Gestión de Consultorios Médicos (EMR/EHR) construido con **Spring Boot 3**, siguiendo las mejores prácticas de HealthTech.

## 🛠 Tech Stack

- **Java 17** con Spring Boot 3.2.1
- **Spring Data JPA** + Hibernate
- **MySQL 8** (XAMPP local)
- **Spring Security 6** (preparado para JWT, actualmente deshabilitado)
- **Lombok** - Reducción de boilerplate
- **MapStruct** - Mapeo DTO-Entidad
- **Bean Validation** - Validaciones

## 📋 Requisitos Previos

1. **Java 17** o superior instalado
2. **Maven** instalado
3. **XAMPP** con MySQL corriendo en puerto 3306
4. Base de datos `consultorio_medico` (se crea automáticamente)

## 🚀 Instalación y Ejecución

### 1. Clonar/Descargar el proyecto

```bash
cd c:\Users\USUARIO\Desktop\consultorio_medico
```

### 2. Iniciar MySQL en XAMPP

Asegúrate de que MySQL esté corriendo en `localhost:3306` con usuario `root` y sin contraseña.

### 3. Compilar el proyecto

```bash
mvn clean install
```

### 4. Ejecutar la aplicación

```bash
mvn spring-boot:run
```

La aplicación estará disponible en: `http://localhost:8080`

## 🏗 Arquitectura

### Estructura de Capas

```
src/main/java/com/consultorio/
├── config/              # Configuraciones (CORS, Security, JPA)
├── controller/          # Controladores REST
├── dto/                 # Data Transfer Objects
├── exception/           # Manejo de excepciones
├── mapper/              # MapStruct mappers
├── model/               # Entidades JPA
├── repository/          # Repositorios Spring Data
└── service/             # Lógica de negocio
```

### Principios Aplicados

✅ **Arquitectura en Capas** - Separación clara de responsabilidades  
✅ **Patrón DTO** - Las entidades JPA nunca se exponen directamente  
✅ **Auditoría Automática** - Todos los registros tienen `createdAt` y `updatedAt`  
✅ **Soft Delete** - Borrado lógico con campo `active`  
✅ **Manejo Global de Errores** - Respuestas JSON estandarizadas  
✅ **CORS Configurado** - Para frontends en localhost:5173 y localhost:3000  

## 📡 API Endpoints - Pacientes

### Base URL: `/api/pacientes`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/pacientes` | Crear nuevo paciente |
| `GET` | `/api/pacientes` | Listar todos los pacientes activos |
| `GET` | `/api/pacientes/{id}` | Obtener paciente por ID |
| `GET` | `/api/pacientes/dni/{dni}` | Obtener paciente por DNI |
| `GET` | `/api/pacientes/buscar?q={texto}` | Buscar pacientes por nombre/apellido |
| `PUT` | `/api/pacientes/{id}` | Actualizar paciente |
| `DELETE` | `/api/pacientes/{id}` | Eliminar paciente (soft delete) |

### Ejemplo: Crear Paciente

**Request:**
```bash
POST http://localhost:8080/api/pacientes
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "email": "juan.perez@email.com",
  "telefono": "+54 11 1234-5678",
  "fechaNacimiento": "1990-05-15"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "email": "juan.perez@email.com",
  "telefono": "+54 11 1234-5678",
  "fechaNacimiento": "1990-05-15",
  "nombreCompleto": "Pérez, Juan",
  "createdAt": "2025-12-11T20:30:00",
  "updatedAt": "2025-12-11T20:30:00",
  "active": true
}
```

### Ejemplo: Listar Pacientes

**Request:**
```bash
GET http://localhost:8080/api/pacientes
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "email": "juan.perez@email.com",
    "telefono": "+54 11 1234-5678",
    "fechaNacimiento": "1990-05-15",
    "nombreCompleto": "Pérez, Juan",
    "createdAt": "2025-12-11T20:30:00",
    "updatedAt": "2025-12-11T20:30:00",
    "active": true
  }
]
```

## 🔒 Seguridad

**Estado Actual:** La seguridad está **DESHABILITADA** temporalmente para facilitar las pruebas.

**Futuro:** Se implementará autenticación JWT con roles:
- `ADMIN` - Acceso total
- `DOCTOR` - Gestión de pacientes y consultas
- `RECEPCIONISTA` - Gestión de citas y pacientes

## 🗄 Base de Datos

### Tabla: `pacientes`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | BIGINT | ID autogenerado |
| `nombre` | VARCHAR(100) | Nombre del paciente |
| `apellido` | VARCHAR(100) | Apellido del paciente |
| `dni` | VARCHAR(20) | DNI único |
| `email` | VARCHAR(150) | Email único |
| `telefono` | VARCHAR(20) | Teléfono |
| `fecha_nacimiento` | DATE | Fecha de nacimiento |
| `created_at` | DATETIME | Fecha de creación |
| `updated_at` | DATETIME | Fecha de última modificación |
| `active` | BOOLEAN | Estado (true = activo) |

**Índices:** `dni`, `email`

## 🧪 Testing con Postman/cURL

### Crear Paciente
```bash
curl -X POST http://localhost:8080/api/pacientes \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"María\",\"apellido\":\"González\",\"dni\":\"87654321\",\"email\":\"maria.gonzalez@email.com\",\"telefono\":\"1122334455\",\"fechaNacimiento\":\"1985-03-20\"}"
```

### Listar Pacientes
```bash
curl http://localhost:8080/api/pacientes
```

### Obtener Paciente por ID
```bash
curl http://localhost:8080/api/pacientes/1
```

### Buscar Pacientes
```bash
curl "http://localhost:8080/api/pacientes/buscar?q=María"
```

### Actualizar Paciente
```bash
curl -X PUT http://localhost:8080/api/pacientes/1 \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"María\",\"apellido\":\"González\",\"dni\":\"87654321\",\"email\":\"maria.nueva@email.com\",\"telefono\":\"1122334455\",\"fechaNacimiento\":\"1985-03-20\"}"
```

### Eliminar Paciente (Soft Delete)
```bash
curl -X DELETE http://localhost:8080/api/pacientes/1
```

## 📝 Validaciones

El sistema valida automáticamente:

- ✅ **Nombre y Apellido:** 2-100 caracteres, obligatorios
- ✅ **DNI:** Solo números, 7-20 dígitos, único
- ✅ **Email:** Formato válido, único
- ✅ **Teléfono:** Solo números y caracteres: `+ - ( )`
- ✅ **Fecha de Nacimiento:** Debe ser anterior a hoy

## 🔧 Configuración

Ver `src/main/resources/application.properties` para configuración de:
- Conexión a base de datos
- Logging de SQL
- Formato de fechas JSON
- Timezone

## 📚 Próximos Pasos

1. Implementar autenticación JWT
2. Agregar entidades: Médicos, Citas, Historias Clínicas
3. Implementar roles y permisos
4. Agregar paginación y ordenamiento
5. Implementar tests unitarios e integración
6. Documentación con Swagger/OpenAPI

## 👨‍💻 Autor

Sistema desarrollado siguiendo las mejores prácticas de HealthTech con arquitectura limpia y escalable.
