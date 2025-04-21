
import { Alert } from '@/types/alerts';
import { supabase } from '@/integrations/supabase/client';

export const alertService = {
  /**
   * Obtiene todas las alertas de la base de datos
   */
  async fetchAlerts() {
    console.log('Fetching alerts from database');
    
    const { data: dbAlerts, error } = await supabase
      .from('alertas')
      .select('*, pozo:pozo_id (id, nombre)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching alerts from database:', error);
      throw error;
    }
    
    console.log('Database alerts fetched:', dbAlerts?.length || 0);
    
    return dbAlerts?.map(alert => ({
      ...alert,
      pozo: {
        id: alert.pozo?.id || '',
        nombre: alert.pozo?.nombre || ''
      }
    })) as Alert[] || [];
  },
  
  /**
   * Marca una alerta como resuelta
   */
  async resolveAlert(alertId: string, resolutionText: string) {
    console.log('Alert resolved callback:', alertId, 'Resolution:', resolutionText);
    
    const fecha_resolucion = new Date().toISOString();
    const updateData = { 
      resuelto: true,
      resolucion: resolutionText,
      fecha_resolucion
    };
    
    console.log('Updating alert in database:', alertId, 'with data:', updateData);
    
    const { error } = await supabase
      .from('alertas')
      .update(updateData)
      .eq('id', alertId);
        
    if (error) {
      console.error('Error updating alert in database:', error);
      throw error;
    }
  },
  
  /**
   * Marca todas las alertas como resueltas
   */
  async resolveAllAlerts(alertIds: string[]) {
    if (!alertIds.length) return;
    
    const fecha_resolucion = new Date().toISOString();
    const { error } = await supabase
      .from('alertas')
      .update({
        resuelto: true,
        resolucion: "Resuelto en lote",
        fecha_resolucion
      })
      .in('id', alertIds);

    if (error) {
      throw error;
    }
  },
  
  /**
   * Elimina una alerta específica
   */
  async deleteAlert(alertId: string) {
    const { error } = await supabase
      .from('alertas')
      .delete()
      .eq('id', alertId);

    if (error) {
      console.error('Error al borrar la alerta:', error);
      throw error;
    }
  },
  
  /**
   * Elimina todas las alertas - corregimos para usar filtro específico
   * y no estamos usando .neq('id', '') que era problemático
   */
  async deleteAllAlerts() {
    // Primero obtenemos todas las alertas para asegurarnos que existen
    const { data } = await supabase
      .from('alertas')
      .select('id');
    
    if (!data || data.length === 0) {
      return; // No hay nada que eliminar
    }
    
    // Usamos un filtro más específico (todas las alertas existentes por ID)
    const alertIds = data.map(alert => alert.id);
    
    const { error } = await supabase
      .from('alertas')
      .delete()
      .in('id', alertIds);

    if (error) {
      console.error('Error al borrar todas las alertas:', error);
      throw error;
    }
  }
};
