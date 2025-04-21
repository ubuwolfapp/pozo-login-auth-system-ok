
// Updates to avoid direct supabase.from('pozos_usuarios'), use RPC functions instead.
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface Well {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  presion: number;
  temperatura: number;
  flujo: number;
  nivel: number;
  nivel_porcentaje: number;
  produccion_diaria: number;
  estado: string;
  ultima_actualizacion: string;
  alertas?: any[];
  tareas?: any[];
  camaras_pozos?: any[];
  fotos_pozos?: any[];
  presion_historial?: any[];
}

export const wellService = {
  async getWells() {
    try {
      // Get current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) {
        console.log('No user logged in');
        return [];
      }

      // Use RPC get_user_wells to get wells assigned to this user
      const { data: wellIds, error: rpcError } = await supabase.rpc(
        'get_user_wells',
        { p_usuario_id: userId }
      );

      if (rpcError || !wellIds || wellIds.length === 0) {
        console.log('No wells assigned to this user');
        return [];
      }

      const wellIdsFlat = Array.isArray(wellIds) ? wellIds : [];

      const { data, error } = await supabase
        .from('pozos')
        .select(`
          *,
          alertas(*),
          tareas(*),
          camaras_pozos(*),
          fotos_pozos(*),
          presion_historial(*)
        `)
        .in('id', wellIdsFlat);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching wells:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pozos",
        variant: "destructive"
      });
      return [];
    }
  },

  async getWellById(id: string) {
    try {
      // Get current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) {
        console.log('No user logged in');
        return null;
      }

      // Use RPC to check if well assigned to user
      const { data: hasAssignment, error: rpcError } = await supabase.rpc(
        'check_well_user_assignment',
        { p_usuario_id: userId, p_pozo_id: id }
      );

      if (rpcError || !hasAssignment) {
        console.log('Well is not assigned to this user:', id);
        return null;
      }

      const { data, error } = await supabase
        .from('pozos')
        .select(`
          *,
          alertas(*),
          tareas(*),
          camaras_pozos(*),
          fotos_pozos(*),
          presion_historial(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // If no pressure history, generate it
      if (!data.presion_historial || data.presion_historial.length === 0) {
        await this.generatePressureHistory(id, data.presion);

        // Reload to get updated history
        const refreshResult = await supabase
          .from('pozos')
          .select(`
            *,
            alertas(*),
            tareas(*),
            camaras_pozos(*),
            fotos_pozos(*),
            presion_historial(*)
          `)
          .eq('id', id)
          .single();

        if (!refreshResult.error) {
          return refreshResult.data;
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching well:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el pozo",
        variant: "destructive"
      });
      return null;
    }
  },

  async generatePressureHistory(wellId: string, basePresion: number = 7500) {
    try {
      // Delete existing pressure history
      await supabase
        .from('presion_historial')
        .delete()
        .eq('pozo_id', wellId);

      // Create 24 records for last 24 hours
      for (let i = 0; i < 24; i++) {
        const fecha = new Date();
        fecha.setHours(fecha.getHours() - i);

        // Variance of ±10%
        const variance = basePresion * 0.1;
        const randomVariance = Math.random() * variance * 2 - variance;
        const presionValue = basePresion + randomVariance;

        await supabase
          .from('presion_historial')
          .insert({
            pozo_id: wellId,
            fecha: fecha.toISOString(),
            valor: presionValue
          });
      }
    } catch (error) {
      console.error('Error generating pressure history:', error);
    }
  },

  async createWell(wellData: {
    nombre: string;
    latitud: number;
    longitud: number;
    presion?: number;
    temperatura?: number;
    flujo?: number;
    nivel?: number;
    produccion_diaria?: number;
    estado?: string;
  }) {
    try {
      // Get current user ID
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) {
        throw new Error('No user logged in');
      }

      // Eliminar todos los pozos existentes excepto dummy ID
      await supabase.from('pozos').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const { data, error } = await supabase.from('pozos').insert({
        nombre: wellData.nombre,
        latitud: wellData.latitud,
        longitud: wellData.longitud,
        presion: wellData.presion || 7500,
        temperatura: wellData.temperatura || 65,
        flujo: wellData.flujo || 500,
        nivel: wellData.nivel || 80,
        nivel_porcentaje: wellData.nivel || 80,
        produccion_diaria: wellData.produccion_diaria || 2500,
        estado: wellData.estado || 'activo'
      }).select('id').single();

      if (error) throw error;

      // Asignar pozo al usuario usando la función assign_well_to_user (RPC)
      if (data && data.id) {
        const { error: assignError } = await supabase.rpc(
          'assign_well_to_user',
          {
            p_usuario_id: userId,
            p_pozo_id: data.id
          }
        );
        if (assignError) throw assignError;
      }

      toast({
        title: "Pozo creado",
        description: "El pozo ha sido creado exitosamente y asignado a tu usuario",
      });

      return data.id;
    } catch (error) {
      console.error('Error creating well:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el pozo",
        variant: "destructive"
      });
      throw error;
    }
  },
  
  async generatePressureHistory(wellId: string, basePresion: number = 7500) {
    try {
      // Delete existing pressure history
      await supabase
        .from('presion_historial')
        .delete()
        .eq('pozo_id', wellId);

      // Create 24 records for last 24 hours
      for (let i = 0; i < 24; i++) {
        const fecha = new Date();
        fecha.setHours(fecha.getHours() - i);

        // Variance of ±10%
        const variance = basePresion * 0.1;
        const randomVariance = Math.random() * variance * 2 - variance;
        const presionValue = basePresion + randomVariance;

        await supabase
          .from('presion_historial')
          .insert({
            pozo_id: wellId,
            fecha: fecha.toISOString(),
            valor: presionValue
          });
      }
    } catch (error) {
      console.error('Error generating pressure history:', error);
    }
  },
};
