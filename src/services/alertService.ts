
import { Alert } from '@/types/alerts';
import { supabase } from '@/integrations/supabase/client';

export const alertService = {
  /**
   * Obtiene todas las alertas de la base de datos para los pozos asignados al usuario actual
   */
  async fetchAlerts() {
    console.log('Fetching alerts from database');
    
    try {
      // Get the current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const userId = userData.user?.id;
      if (!userId) {
        console.log('No user is logged in');
        return [];
      }
      
      // Get wells assigned to the current user
      const { data: userWells, error: wellsError } = await supabase
        .from('pozos_usuarios')
        .select('pozo_id')
        .eq('usuario_id', userId);
        
      if (wellsError) throw wellsError;
      
      if (!userWells || userWells.length === 0) {
        console.log('No wells assigned to current user');
        return [];
      }
      
      // Extract well IDs
      const wellIds = userWells.map(well => well.pozo_id);
      
      // Fetch alerts for the user's wells
      const { data: dbAlerts, error } = await supabase
        .from('alertas')
        .select('*, pozo:pozo_id (id, nombre)')
        .in('pozo_id', wellIds)
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
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
      return [];
    }
  },
  
  /**
   * Marca una alerta como resuelta
   */
  async resolveAlert(alertId: string, resolutionText: string) {
    console.log('Alert resolved callback:', alertId, 'Resolution:', resolutionText);
    
    // Verify user has access to this alert
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) throw new Error("No user is logged in");
    
    // Check if the alert belongs to a well assigned to the user
    const { data: alert, error: alertError } = await supabase
      .from('alertas')
      .select('pozo_id')
      .eq('id', alertId)
      .single();
    
    if (alertError) throw alertError;
    
    const { data: assignment, error: assignmentError } = await supabase
      .from('pozos_usuarios')
      .select('id')
      .eq('usuario_id', userId)
      .eq('pozo_id', alert.pozo_id)
      .single();
    
    if (assignmentError || !assignment) {
      throw new Error("Usuario no tiene acceso a esta alerta");
    }
    
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
   * Marca todas las alertas como resueltas, solo para los pozos asignados al usuario
   */
  async resolveAllAlerts(alertIds: string[]) {
    if (!alertIds.length) return;
    
    // Verify user has access to these alerts
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) throw new Error("No user is logged in");
    
    // Get wells assigned to the user
    const { data: userWells } = await supabase
      .from('pozos_usuarios')
      .select('pozo_id')
      .eq('usuario_id', userId);
    
    if (!userWells || userWells.length === 0) return;
    
    const userWellIds = userWells.map(w => w.pozo_id);
    
    // Get alerts that belong to the user's wells
    const { data: allowedAlerts } = await supabase
      .from('alertas')
      .select('id')
      .in('pozo_id', userWellIds)
      .in('id', alertIds);
    
    if (!allowedAlerts || allowedAlerts.length === 0) return;
    
    const allowedAlertIds = allowedAlerts.map(a => a.id);
    
    const fecha_resolucion = new Date().toISOString();
    const { error } = await supabase
      .from('alertas')
      .update({
        resuelto: true,
        resolucion: "Resuelto en lote",
        fecha_resolucion
      })
      .in('id', allowedAlertIds);

    if (error) {
      throw error;
    }
  },
  
  /**
   * Elimina una alerta específica
   */
  async deleteAlert(alertId: string) {
    // Verify user has access to this alert
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) throw new Error("No user is logged in");
    
    // Check if the alert belongs to a well assigned to the user
    const { data: alert, error: alertError } = await supabase
      .from('alertas')
      .select('pozo_id')
      .eq('id', alertId)
      .single();
    
    if (alertError) throw alertError;
    
    const { data: assignment, error: assignmentError } = await supabase
      .from('pozos_usuarios')
      .select('id')
      .eq('usuario_id', userId)
      .eq('pozo_id', alert.pozo_id)
      .single();
    
    if (assignmentError || !assignment) {
      throw new Error("Usuario no tiene acceso a esta alerta");
    }
    
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
   * Elimina todas las alertas de los pozos asignados al usuario
   */
  async deleteAllAlerts() {
    // Verify user is logged in
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) throw new Error("No user is logged in");
    
    // Get wells assigned to the user
    const { data: userWells } = await supabase
      .from('pozos_usuarios')
      .select('pozo_id')
      .eq('usuario_id', userId);
    
    if (!userWells || userWells.length === 0) return;
    
    const userWellIds = userWells.map(w => w.pozo_id);
    
    // Get alerts that belong to the user's wells
    const { data: alerts } = await supabase
      .from('alertas')
      .select('id')
      .in('pozo_id', userWellIds);
    
    if (!alerts || alerts.length === 0) {
      return; // No hay nada que eliminar
    }
    
    // Eliminar solo las alertas de los pozos del usuario
    const alertIds = alerts.map(alert => alert.id);
    
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
