
const express = require('express');
const { check, validationResult } = require('express-validator');
const Report = require('../models/Report');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Ruta para obtener datos de reporte
// POST /reportes
router.post('/', [
  authenticateToken,
  check('pozo_id').isInt().withMessage('pozo_id debe ser un número entero'),
  check('fecha_inicio').isISO8601().withMessage('fecha_inicio debe tener formato ISO8601'),
  check('fecha_fin').isISO8601().withMessage('fecha_fin debe tener formato ISO8601'),
  check('parametro').isString().withMessage('parametro debe ser una cadena')
], async (req, res) => {
  // Validar entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pozo_id, fecha_inicio, fecha_fin, parametro } = req.body;
  
  try {
    const reportData = await Report.getReportData(
      pozo_id,
      fecha_inicio,
      fecha_fin,
      parametro
    );
    
    return res.status(200).json(reportData);
  } catch (error) {
    console.error('Error al obtener datos del reporte:', error);
    return res.status(500).json({ message: 'Error al obtener datos del reporte' });
  }
});

module.exports = router;
