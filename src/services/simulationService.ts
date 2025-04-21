
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
      
      // Check if the well is assigned to the current user
      const { data: assignedWell, error: assignmentError } = await supabase
        .from('pozos_usuarios')
        .select('pozo_id')
        .eq('usuario_id', userId)
        .eq('pozo_id', pozoId)
        .single();
      
      if (assignmentError || !assignedWell) {
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
      
      // Get wells assigned to the current user
      const { data: userWells, error: wellsError } = await supabase
        .from('pozos_usuarios')
        .select('pozo_id')
        .eq('usuario_id', userId);

      if (wellsError) throw wellsError;

      if (!userWells || userWells.length === 0) {
        console.log('No wells assigned to current user');
        return false;
      }

      // Simulate values for each of the user's assigned wells
      for (const well of userWells) {
        await this.simulateWellValues(well.pozo_id);
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
