
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface UserSettings {
  id: string;
  usuario_id: string | null;
  notificaciones_activas: boolean;
  push_activo: boolean;
  correo_activo: boolean;
  sms_activo: boolean;
  umbral_presion: number;
  umbral_temperatura: number;
  umbral_flujo: number;
  idioma: string;
  simulacion_activa: boolean;
}

export interface PozoUmbral {
  id: string;
  pozo_id: string;
  usuario_id: string;
  umbral_presion: number;
  umbral_temperatura: number;
  umbral_flujo: number;
  created_at: string;
  updated_at: string;
  pozo?: {
    id: string;
    nombre: string;
  };
}

export const settingsService = {
  async getUserSettings() {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) throw new Error("No user is logged in");

      let { data: settings, error } = await supabase
        .from('configuracion_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .maybeSingle();

      if (!settings) {
        const defaultSettings = {
          usuario_id: userId,
          notificaciones_activas: true,
          push_activo: true,
          correo_activo: true,
          sms_activo: true,
          umbral_presion: 8000,
          umbral_temperatura: 85,
          umbral_flujo: 600,
          idioma: 'español',
          simulacion_activa: true,
        };

        const { data: newSettings, error: insertError } = await supabase
          .from('configuracion_usuario')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        return newSettings as UserSettings;
      }

      if (error) throw error;
      
      return {
        ...settings,
        umbral_temperatura: settings.umbral_temperatura ?? 85,
        umbral_flujo: settings.umbral_flujo ?? 600,
        simulacion_activa: settings.simulacion_activa ?? true,
      } as UserSettings;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar la configuración",
        variant: "destructive"
      });
      return null;
    }
  },

  async updateSettings(settings: Partial<UserSettings>) {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const userId = userData.user?.id;
      if (!userId) throw new Error("No user is logged in");

      const { data: existingSettings, error: checkError } = await supabase
        .from('configuracion_usuario')
        .select('id')
        .eq('usuario_id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!existingSettings) {
        const defaultSettings = {
          usuario_id: userId,
          notificaciones_activas: true,
          push_activo: true,
          correo_activo: true,
          sms_activo: true,
          umbral_presion: 8000,
          umbral_temperatura: 85,
          umbral_flujo: 600,
          idioma: 'español',
          simulacion_activa: true,
          ...settings
        };

        const { data, error: insertError } = await supabase
          .from('configuracion_usuario')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;

        toast({
          title: "Éxito",
          description: "Configuración creada correctamente",
        });

        return data as UserSettings;
      } else {
        const { data, error } = await supabase
          .from('configuracion_usuario')
          .update(settings)
          .eq('usuario_id', userId)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Configuración actualizada correctamente",
        });

        return {
          ...data,
          simulacion_activa: data.simulacion_activa ?? true
        } as UserSettings;
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      });
      return null;
    }
  },

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
