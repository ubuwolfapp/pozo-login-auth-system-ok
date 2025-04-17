
/**
 * Servidor Express para la API de autenticación
 * de la aplicación "Monitoreo de Pozos"
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

// Configuración del servidor
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conexión a la base de datos PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pozos_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_para_jwt_desarrollo';

// Middleware de validación
const validateLogin = [
  check('email')
    .isEmail()
    .withMessage('Por favor, ingrese un email válido'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

// Rutas
app.post('/api/login', validateLogin, async (req, res) => {
  // Validar entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Buscar usuario por email
    const userResult = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );

    // Verificar si el usuario existe
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const user = userResult.rows[0];

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        rol: user.rol
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Respuesta exitosa
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para solicitar recuperación de contraseña (simulada)
app.post('/api/forgot-password', [
  check('email').isEmail().withMessage('Email inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // En una implementación real, aquí enviarías un email con un link para restablecer la contraseña
  // Por ahora, solo devolvemos una respuesta exitosa
  return res.status(200).json({ message: 'Si existe una cuenta con ese email, recibirá instrucciones para restablecer su contraseña.' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
