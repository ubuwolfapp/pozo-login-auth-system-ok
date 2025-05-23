
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

      // Call the Supabase RPC function to simulate values
      const { error } = await supabase.rpc('simular_valores_pozo', {
        p_pozo_id: pozoId
      });

      if (error) throw error;

      // Get the current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) throw new Error("No user is logged in");

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
      
      // Get all wells
      const { data: wells, error: wellsError } = await supabase
        .from('pozos')
        .select('id');

      if (wellsError) throw wellsError;

      if (!wells || wells.length === 0) return false;

      // Simulate values for each well
      for (const well of wells) {
        await this.simulateWellValues(well.id);
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
