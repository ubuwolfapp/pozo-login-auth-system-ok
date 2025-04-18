
-- Script de creación de tablas para la pantalla de reportes

-- Crear la tabla de pozos si no existe
CREATE TABLE IF NOT EXISTS pozos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Crear tabla para los datos de reportes
CREATE TABLE IF NOT EXISTS reportes_datos (
    id SERIAL PRIMARY KEY,
    pozo_id INTEGER NOT NULL REFERENCES pozos(id),
    fecha DATE NOT NULL,
    parametro VARCHAR(50) NOT NULL,
    valor FLOAT NOT NULL
);

-- Crear tabla para resumen de parámetros
CREATE TABLE IF NOT EXISTS resumen_parametros (
    id SERIAL PRIMARY KEY,
    pozo_id INTEGER NOT NULL REFERENCES pozos(id),
    parametro VARCHAR(50) NOT NULL,
    valor VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL
);

-- Insertar datos de prueba
-- Insertar pozo de prueba
INSERT INTO pozos (id, nombre) 
VALUES (1, 'Pozo #1')
ON CONFLICT (id) DO NOTHING;

-- Insertar datos de producción para 16 días
INSERT INTO reportes_datos (pozo_id, fecha, parametro, valor) VALUES
    (1, '2025-04-01', 'produccion', 2000),
    (1, '2025-04-02', 'produccion', 2500),
    (1, '2025-04-03', 'produccion', 3000),
    (1, '2025-04-04', 'produccion', 2000),
    (1, '2025-04-05', 'produccion', 3500),
    (1, '2025-04-06', 'produccion', 3000),
    (1, '2025-04-07', 'produccion', 2500),
    (1, '2025-04-08', 'produccion', 4000),
    (1, '2025-04-09', 'produccion', 3000),
    (1, '2025-04-10', 'produccion', 3500),
    (1, '2025-04-11', 'produccion', 2000),
    (1, '2025-04-12', 'produccion', 2500),
    (1, '2025-04-13', 'produccion', 3000),
    (1, '2025-04-14', 'produccion', 3500),
    (1, '2025-04-15', 'produccion', 4000),
    (1, '2025-04-16', 'produccion', 3000);

-- Insertar datos de resumen de parámetros
INSERT INTO resumen_parametros (pozo_id, parametro, valor, estado) VALUES
    (1, 'presion', '8500 psi', 'Pendiente'),
    (1, 'temperatura', '75°C', 'En Progreso'),
    (1, 'idioma', 'Idioma', '');
