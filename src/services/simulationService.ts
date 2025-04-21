
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const simulationService = {
  async simulateWellValues(pozoId: string) {
    try {
      // Llamar a la función RPC de Supabase para simular valores
      const { error } = await supabase.rpc('simular_valores_pozo', {
        p_pozo_id: pozoId
      });

      if (error) throw error;

      // Obtener el ID del usuario actual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) throw new Error("No user is logged in");

      // Comprobar umbrales y generar alertas si es necesario
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
      // Obtener todos los pozos
      const { data: wells, error: wellsError } = await supabase
        .from('pozos')
        .select('id');

      if (wellsError) throw wellsError;

      if (!wells || wells.length === 0) return false;

      // Simular valores para cada pozo
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
