
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
        .limit(1);  // Asegurarse de que solo devuelva un pozo

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
      
      // Si no hay datos de presión histórica, crearlos
      if (!data.presion_historial || data.presion_historial.length === 0) {
        await this.generatePressureHistory(id, data.presion);
        
        // Recargar los datos para obtener el historial generado
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
      // Eliminar datos históricos existentes
      await supabase
        .from('presion_historial')
        .delete()
        .eq('pozo_id', wellId);
      
      // Crear 24 registros para las últimas 24 horas
      for (let i = 0; i < 24; i++) {
        const fecha = new Date();
        fecha.setHours(fecha.getHours() - i);
        
        // Variar la presión ligeramente (±10%)
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
      // Primero eliminamos todos los pozos existentes
      await supabase.from('pozos').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const { data, error } = await supabase.rpc(
        'crear_pozo_completo',
        {
          p_nombre: wellData.nombre,
          p_latitud: wellData.latitud,
          p_longitud: wellData.longitud,
          p_presion: wellData.presion || 7500,
          p_temperatura: wellData.temperatura || 65,
          p_flujo: wellData.flujo || 500,
          p_nivel: wellData.nivel || 80,
          p_produccion_diaria: wellData.produccion_diaria || 2500,
          p_estado: wellData.estado || 'activo'
        }
      );

      if (error) throw error;

      toast({
        title: "Pozo creado",
        description: "El pozo ha sido creado exitosamente y es el único en el sistema",
      });

      return data;
    } catch (error) {
      console.error('Error creating well:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el pozo",
        variant: "destructive"
      });
      throw error;
    }
  }
};
