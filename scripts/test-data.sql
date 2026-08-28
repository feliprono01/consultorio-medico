-- Script SQL para datos de prueba
-- Sistema de Gestión de Consultorios Médicos

-- Nota: Este script es opcional. Las tablas se crean automáticamente
-- al iniciar la aplicación Spring Boot gracias a spring.jpa.hibernate.ddl-auto=update

-- Si deseas insertar datos de prueba manualmente, puedes usar estos INSERT
-- (Asegúrate de que la aplicación ya haya creado las tablas primero)

-- Pacientes de prueba
INSERT INTO pacientes (nombre, apellido, dni, email, telefono, fecha_nacimiento, created_at, updated_at, active) 
VALUES 
('Juan', 'Pérez', '12345678', 'juan.perez@email.com', '+54 11 1234-5678', '1990-05-15', NOW(), NOW(), true),
('María', 'González', '87654321', 'maria.gonzalez@email.com', '+54 11 8765-4321', '1985-03-20', NOW(), NOW(), true),
('Carlos', 'Rodríguez', '11223344', 'carlos.rodriguez@email.com', '+54 11 1122-3344', '1978-11-10', NOW(), NOW(), true),
('Ana', 'Martínez', '44332211', 'ana.martinez@email.com', '+54 11 4433-2211', '1995-07-25', NOW(), NOW(), true),
('Luis', 'Fernández', '55667788', 'luis.fernandez@email.com', '+54 11 5566-7788', '1982-01-30', NOW(), NOW(), true);

-- Verificar datos insertados
SELECT * FROM pacientes WHERE active = true ORDER BY apellido;
