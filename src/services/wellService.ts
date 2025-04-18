
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
}

export const wellService = {
  async getWells() {
    try {
      const { data, error } = await supabase
        .from('pozos')
        .select('*')
        .order('nombre');

      if (error) throw error;
      return data;
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
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
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

  async getWellAlerts(wellId: string) {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .select('*')
        .eq('pozo_id', wellId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las alertas",
        variant: "destructive"
      });
      return [];
    }
  }
};
