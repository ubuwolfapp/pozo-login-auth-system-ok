
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const simulationService = {
  async simulateWellValues(pozoId: string) {
    try {
      console.log(`Simulando valores para pozo ID: ${pozoId}`);
      
      // Llamar a la función RPC de Supabase para simular valores
      const { error } = await supabase.rpc('simular_valores_pozo', {
        p_pozo_id: pozoId
      });

      if (error) {
        console.error('Error al simular valores:', error);
        throw error;
      }

      // Obtener el ID del usuario actual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) throw new Error("No user is logged in");

      console.log(`Comprobando umbrales para pozo ID: ${pozoId}, usuario ID: ${userId}`);
      
      // Comprobar umbrales y generar alertas si es necesario
      const { error: checkError } = await supabase.rpc('comprobar_umbrales_pozo', {
        p_pozo_id: pozoId,
        p_usuario_id: userId
      });

      if (checkError) {
        console.error('Error al comprobar umbrales:', checkError);
        throw checkError;
      }
      
      console.log(`Simulación completada para pozo ID: ${pozoId}`);
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

  // Método para simular solo los pozos del usuario actual
  async simulateUserWells() {
    try {
      // Obtener ID del usuario actual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) throw new Error("No user is logged in");

      console.log(`Simulando valores para pozos del usuario: ${userId}`);
      
      // Obtener todos los pozos asignados al usuario actual
      // Como no tenemos una tabla de asignación de usuarios, usaremos todos los pozos
      // En un sistema real, filtraríamos por pozos asignados al usuario
      const { data: wells, error: wellsError } = await supabase
        .from('pozos')
        .select('id');

      if (wellsError) throw wellsError;

      if (!wells || wells.length === 0) {
        console.log('No se encontraron pozos para el usuario');
        return false;
      }

      console.log(`Simulando valores para ${wells.length} pozos del usuario actual`);

      // Simular valores para cada pozo del usuario
      for (const well of wells) {
        await this.simulateWellValues(well.id);
      }

      return true;
    } catch (error) {
      console.error('Error simulating user wells:', error);
      toast({
        title: "Error",
        description: "No se pudieron simular los valores de los pozos",
        variant: "destructive"
      });
      return false;
    }
  },

  // Mantenemos el método original para compatibilidad
  async simulateAllWells() {
    return this.simulateUserWells();
  }
};
