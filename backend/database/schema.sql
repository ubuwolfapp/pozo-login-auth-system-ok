
-- Script de creación de base de datos para la aplicación "Monitoreo de Pozos"

-- Crear la base de datos
CREATE DATABASE pozos_db;

-- Conectar a la base de datos
\c pozos_db;

-- Crear la tabla usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar un usuario de prueba
-- La contraseña "contraseña123" está encriptada con bcrypt
-- En una implementación real, deberías generar el hash en el momento de la inserción
INSERT INTO usuarios (email, password, nombre, rol) VALUES 
('juan.perez@empresa.com', '$2b$10$8KzS.93yrHoG4jQB7OKVy.0JyCh8PxPXT05NoiM5fP5OMGzpZQn3a', 'Juan Pérez', 'ingeniero');

-- NOTA: El hash anterior fue generado con:
-- const bcrypt = require('bcrypt');
-- const hash = bcrypt.hashSync('contraseña123', 10);
