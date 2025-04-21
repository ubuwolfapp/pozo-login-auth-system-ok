
// Fixed usage of pozos_usuarios and replaced direct with RPC calls and fixed type usage.
import { Alert } from '@/types/alerts';
import { supabase } from '@/integrations/supabase/client';

export const alertService = {
  /**
   * Get alerts for wells assigned to logged-in user using appropriate RPCs.
   */
  async fetchAlerts() {
    console.log('Fetching alerts from database');

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) {
        console.log('No user logged in');
        return [];
      }

      // Use RPC to get user's wells IDs
      const { data: userWellIds, error: rpcError } = await supabase.rpc(
        'get_user_wells',
        { p_usuario_id: userId }
      );

      if (rpcError || !userWellIds || userWellIds.length === 0) {
        console.log('No wells assigned to current user');
        return [];
      }

      // Fetch alerts for user's wells
      const { data: dbAlerts, error } = await supabase
        .from('alertas')
        .select('*, pozo:pozo_id (id, nombre)')
        .in('pozo_id', userWellIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
        throw error;
      }

      return (dbAlerts?.map(alert => ({
        ...alert,
        pozo: {
          id: alert.pozo?.id || '',
          nombre: alert.pozo?.nombre || ''
        }
      })) as Alert[]) || [];
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
      return [];
    }
  },

  async resolveAlert(alertId: string, resolutionText: string) {
    console.log('Resolving alert:', alertId, 'Resolution:', resolutionText);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("No user logged in");

    // Get the alert to check if it belongs to a user's well
    const { data: alert, error: alertError } = await supabase
      .from('alertas')
      .select('pozo_id')
      .eq('id', alertId)
      .single();

    if (alertError || !alert) throw alertError || new Error("Alert not found");

    // Check well-user assignment via RPC
    const { data: hasAccess, error: accessError } = await supabase.rpc(
      'check_well_user_assignment',
      { p_usuario_id: userId, p_pozo_id: alert.pozo_id }
    );

    if (accessError || !hasAccess) {
      throw new Error("User has no access to this alert");
    }

    const fecha_resolucion = new Date().toISOString();
    const updateData = {
      resuelto: true,
      resolucion: resolutionText,
      fecha_resolucion,
    };

    const { error } = await supabase
      .from('alertas')
      .update(updateData)
      .eq('id', alertId);

    if (error) {
      console.error('Error updating alert:', error);
      throw error;
    }
  },

  async resolveAllAlerts(alertIds: string[]) {
    if (!alertIds.length) return;

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("No user logged in");

    // Get wells assigned to user through RPC
    const { data: userWellIds, error: rpcError } = await supabase.rpc(
      'get_user_wells',
      { p_usuario_id: userId }
    );

    if (rpcError || !userWellIds || userWellIds.length === 0) return;

    // Get alerts belonging to user's wells
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
        fecha_resolucion,
      })
      .in('id', allowedAlertIds);

    if (error) {
      throw error;
    }
  },

  async deleteAlert(alertId: string) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("No user logged in");

    const { data: alert, error: alertError } = await supabase
      .from('alertas')
      .select('pozo_id')
      .eq('id', alertId)
      .single();

    if (alertError || !alert) throw alertError || new Error("Alert not found");

    const { data: hasAccess, error: accessError } = await supabase.rpc(
      'check_well_user_assignment',
      { p_usuario_id: userId, p_pozo_id: alert.pozo_id }
    );

    if (accessError || !hasAccess) {
      throw new Error("User has no access to this alert");
    }

    const { error } = await supabase
      .from('alertas')
      .delete()
      .eq('id', alertId);

    if (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  },

  async deleteAllAlerts() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("No user logged in");

    const { data: userWellIds, error: rpcError } = await supabase.rpc(
      'get_user_wells',
      { p_usuario_id: userId }
    );

    if (rpcError || !userWellIds || userWellIds.length === 0) return;

    const { data: alerts } = await supabase
      .from('alertas')
      .select('id')
      .in('pozo_id', userWellIds);

    if (!alerts || alerts.length === 0) {
      return;
    }

    const alertIds = alerts.map(alert => alert.id);

    const { error } = await supabase
      .from('alertas')
      .delete()
      .in('id', alertIds);

    if (error) {
      console.error('Error deleting all alerts:', error);
      throw error;
    }
  }
};
