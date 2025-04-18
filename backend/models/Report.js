
const db = require('../config/db');

class Report {
  // Obtener datos de reporte por pozo, rango de fechas y parámetro
  static async getReportData(pozo_id, fecha_inicio, fecha_fin, parametro) {
    try {
      // Obtener el nombre del pozo
      const pozoResult = await db.query(
        'SELECT nombre FROM pozos WHERE id = $1',
        [pozo_id]
      );
      
      if (pozoResult.rows.length === 0) {
        throw new Error('Pozo no encontrado');
      }
      
      const pozo_nombre = pozoResult.rows[0].nombre;
      
      // Obtener datos de reporte para el parámetro y rango de fechas
      const reporteResult = await db.query(
        `SELECT fecha, valor 
         FROM reportes_datos 
         WHERE pozo_id = $1 AND parametro = $2 AND fecha BETWEEN $3 AND $4 
         ORDER BY fecha ASC`,
        [pozo_id, parametro, fecha_inicio, fecha_fin]
      );
      
      // Obtener resumen de parámetros
      const resumenResult = await db.query(
        'SELECT parametro, valor, estado FROM resumen_parametros WHERE pozo_id = $1',
        [pozo_id]
      );
      
      // Formatear datos para el frontend
      const fechas = reporteResult.rows.map(row => row.fecha);
      const valores = reporteResult.rows.map(row => parseFloat(row.valor));
      
      return {
        pozo_nombre,
        fechas,
        valores,
        resumen: resumenResult.rows
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Report;
