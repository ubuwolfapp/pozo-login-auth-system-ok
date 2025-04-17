# Monitoreo de Pozos - Sistema de Login

Sistema de autenticación para la aplicación "Monitoreo de Pozos" que incluye una interfaz de login con validación de usuarios contra una base de datos PostgreSQL.

![Pantalla de Login de Monitoreo de Pozos](public/lovable-uploads/ddc8c695-fc9d-4fa6-a365-bf5f7258bddb.png)

## Características

- **Interfaz de usuario:**
  - Diseño moderno con gradiente de fondo azul petróleo (#1C2526 a #2E3A59)
  - Formulario de login con validación
  - Opción para mostrar/ocultar contraseña
  - Enlace para recuperación de contraseña
  - Diseño responsivo

- **Autenticación:**
  - Validación de credenciales contra base de datos
  - Tokens JWT
  - Contraseñas encriptadas con bcrypt
  - Protección de rutas

- **Tecnologías:**
  - Frontend: React, TypeScript, Tailwind CSS
  - Backend: Node.js, Express
  - Base de datos: PostgreSQL

## Estructura del proyecto

El proyecto está organizado en dos partes principales:

- **Frontend (carpeta raíz)**: Implementación React de la interfaz de usuario
- **Backend (carpeta /backend)**: API RESTful con autenticación y conexión a PostgreSQL

## Instalación y ejecución

### Frontend

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

### Backend

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Configurar la base de datos
psql -U postgres -f database/schema.sql

# Iniciar el servidor
npm start
```

Consulte el archivo `backend/README.md` para obtener instrucciones más detalladas sobre la configuración del backend.

## Credenciales de prueba

- Email: juan.perez@empresa.com
- Contraseña: contraseña123

## Variables de entorno

### Backend

Cree un archivo `.env` en la carpeta `backend` con las siguientes variables:

```
PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=pozos_db
DB_PASSWORD=su_contraseña
DB_PORT=5432
JWT_SECRET=clave_secreta_para_produccion
```

## Rutas de la aplicación

- `/`: Pantalla de login
- `/forgot-password`: Formulario de recuperación de contraseña
- `/dashboard`: Panel principal (protegido, requiere autenticación)

## Endpoints de la API

- `POST /api/login`: Autenticación de usuario
- `POST /api/forgot-password`: Solicitud de recuperación de contraseña

## Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación mediante tokens JWT
- Validaciones contra ataques de inyección SQL
- Mensajes de error genéricos para evitar la enumeración de usuarios

## Notas para desarrollo

Este proyecto fue desarrollado inicialmente como una demostración de interfaz. Para un entorno de producción, considere:

1. Implementar un sistema completo de recuperación de contraseñas
2. Usar HTTPS para todas las comunicaciones
3. Agregar rate limiting para prevenir ataques de fuerza bruta
4. Implementar autenticación de dos factores
