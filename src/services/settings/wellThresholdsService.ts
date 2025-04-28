
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { PozoUmbral } from "./types";

export const wellThresholdsService = {
  async getWellsUmbrales() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) throw new Error("No user is logged in");

      const { data, error } = await supabase
        .from('umbrales_pozo')
        .select('*, pozo:pozo_id(id, nombre)')
        .eq('usuario_id', userId);

      if (error) throw error;
      return data as PozoUmbral[] || [];
    } catch (error) {
      console.error('Error fetching well thresholds:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los umbrales de los pozos",
        variant: "destructive"
      });
      return [];
    }
  },

  async getWellUmbral(pozoId: string) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) throw new Error("No user is logged in");

      const { data, error } = await supabase
        .from('umbrales_pozo')
        .select('*')
        .eq('pozo_id', pozoId)
        .eq('usuario_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: generalSettings } = await supabase
          .from('configuracion_usuario')
          .select('umbral_presion, umbral_temperatura, umbral_flujo')
          .eq('usuario_id', userId)
          .maybeSingle();

        if (generalSettings) {
          return {
            pozo_id: pozoId,
            usuario_id: userId,
            umbral_presion: generalSettings.umbral_presion ?? 8000,
            umbral_temperatura: generalSettings.umbral_temperatura ?? 85,
            umbral_flujo: generalSettings.umbral_flujo ?? 600
          };
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching well threshold:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los umbrales del pozo",
        variant: "destructive"
      });
      return null;
    }
  },

  async updateWellUmbral(pozoId: string, umbrales: {
    umbral_presion?: number;
    umbral_temperatura?: number;
    umbral_flujo?: number;
  }) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) throw new Error("No user is logged in");

      const { data: existing } = await supabase
        .from('umbrales_pozo')
        .select('id')
        .eq('pozo_id', pozoId)
        .eq('usuario_id', userId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('umbrales_pozo')
          .update(umbrales)
          .eq('id', existing.id)
          .select();

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Umbrales del pozo actualizados correctamente",
        });

        return data[0];
      } else {
        const newUmbral = {
          pozo_id: pozoId,
          usuario_id: userId,
          ...umbrales
        };

        const { data, error } = await supabase
          .from('umbrales_pozo')
          .insert(newUmbral)
          .select();

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Umbrales del pozo creados correctamente",
        });

        return data[0];
      }
    } catch (error) {
      console.error('Error updating well thresholds:', error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los umbrales del pozo",
        variant: "destructive"
      });
      return null;
    }
  }
};
