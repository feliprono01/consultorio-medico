-- Script para crear usuario admin
-- La contraseña es: admin (encriptada con BCrypt)
-- Ejecutar este script en MySQL/phpMyAdmin

INSERT INTO usuarios (username, password, role) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGDCJ0C9RkGh5H4mYG.9EhW2e', 'ADMIN')
ON DUPLICATE KEY UPDATE password='$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGDCJ0C9RkGh5H4mYG.9EhW2e';

-- Verificar que el usuario fue creado
SELECT * FROM usuarios;
