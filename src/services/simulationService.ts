
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { settingsService } from "./settingsService";

export const simulationService = {
  async simulateWellValues(pozoId: string) {
    try {
      // Check if simulation is enabled in user settings
      const settings = await settingsService.getUserSettings();
      if (settings && settings.simulacion_activa === false) {
        console.log('Simulation is disabled in user settings');
        return false;
      }

      // Verify if the well belongs to the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const userId = userData.user?.id;
      if (!userId) throw new Error("No user is logged in");
      
      // Check if the well is assigned to the current user using RPC function
      // This avoids the TypeScript error with the pozos_usuarios table
      const { data: wellBelongsToUser, error: rpcError } = await supabase.rpc(
        'check_well_user_assignment',
        { p_usuario_id: userId, p_pozo_id: pozoId }
      );
      
      if (rpcError || !wellBelongsToUser) {
        console.log('Well is not assigned to current user:', pozoId);
        return false;
      }

      // Call the Supabase RPC function to simulate values
      const { error } = await supabase.rpc('simular_valores_pozo', {
        p_pozo_id: pozoId
      });

      if (error) throw error;

      // Check thresholds and generate alerts if needed
      const { error: checkError } = await supabase.rpc('comprobar_umbrales_pozo', {
        p_pozo_id: pozoId,
        p_usuario_id: userId
      });

      if (checkError) throw checkError;

      return true;
    } catch (error) {
      console.error('Error simulating well values:', error);
      toast({
        title: "Error",
        description: "No se pudieron simular los valores del pozo",
        variant: "destructive"
      });
      return false;
    }
  },

  async simulateAllWells() {
    try {
      // Check if simulation is enabled in user settings
      const settings = await settingsService.getUserSettings();
      if (settings && settings.simulacion_activa === false) {
        console.log('Simulation is disabled in user settings');
        return false;
      }
      
      // Get the current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const userId = userData.user?.id;
      if (!userId) throw new Error("No user is logged in");
      
      // Get wells assigned to the current user using RPC function
      const { data: userWellIds, error: rpcError } = await supabase.rpc(
        'get_user_wells',
        { p_usuario_id: userId }
      );

      if (rpcError || !userWellIds || !userWellIds.length) {
        console.log('No wells assigned to current user');
        return false;
      }

      // Simulate values for each of the user's assigned wells
      for (const wellId of userWellIds) {
        await this.simulateWellValues(wellId);
      }

      return true;
    } catch (error) {
      console.error('Error simulating all wells:', error);
      toast({
        title: "Error",
        description: "No se pudieron simular los valores de los pozos",
        variant: "destructive"
      });
      return false;
    }
  }
};
