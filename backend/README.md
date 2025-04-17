
# Backend - Monitoreo de Pozos

Backend para la aplicación de "Monitoreo de Pozos" desarrollado con Node.js, Express y PostgreSQL.

## Requisitos

- Node.js v14 o superior
- PostgreSQL v12 o superior

## Configuración

1. **Instalar dependencias:**

```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**

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

3. **Crear la base de datos:**

Ejecute el script SQL en su servidor PostgreSQL:

```bash
psql -U postgres -f database/schema.sql
```

## Ejecución

```bash
npm start
```

El servidor se ejecutará en http://localhost:3001

## API Endpoints

### Autenticación

- **POST /api/login**
  - Descripción: Autentica un usuario
  - Request body: `{ "email": "usuario@ejemplo.com", "password": "contraseña" }`
  - Respuesta exitosa: `{ "token": "jwt_token", "user": { ... } }`

- **POST /api/forgot-password**
  - Descripción: Solicita recuperación de contraseña
  - Request body: `{ "email": "usuario@ejemplo.com" }`
  - Respuesta exitosa: `{ "message": "..." }`

## Seguridad

- Las contraseñas se almacenan encriptadas con bcrypt
- La autenticación se realiza con tokens JWT
- Las validaciones previenen ataques de inyección SQL

## Usuario de prueba

- Email: juan.perez@empresa.com
- Contraseña: contraseña123
