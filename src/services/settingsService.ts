
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
      // Get the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const userId = userData.user?.id;
      if (!userId) throw new Error("No user is logged in");

      // Try to fetch existing settings
      let { data: settings, error } = await supabase
        .from('configuracion_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .maybeSingle();
      
      // If no settings exist, create default settings
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
          idioma: 'español'
        };
        
        const { data: newSettings, error: insertError } = await supabase
          .from('configuracion_usuario')
          .insert(defaultSettings)
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newSettings;
      }
      
      if (error) throw error;
      return settings;
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

      // Check if settings exist for this user
      const { data: existingSettings, error: checkError } = await supabase
        .from('configuracion_usuario')
        .select('id')
        .eq('usuario_id', userId)
        .maybeSingle();
      
      if (checkError) throw checkError;

      if (!existingSettings) {
        // Create default settings with the updates applied
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
        
        return data;
      } else {
        // Update existing settings
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
        
        return data;
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
      return data || [];
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
      
      // Si no existe configuración específica para este pozo, devolvemos la configuración general
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
            umbral_presion: generalSettings.umbral_presion,
            umbral_temperatura: generalSettings.umbral_temperatura,
            umbral_flujo: generalSettings.umbral_flujo
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

      // Verificar si ya existe una configuración para este pozo
      const { data: existing } = await supabase
        .from('umbrales_pozo')
        .select('id')
        .eq('pozo_id', pozoId)
        .eq('usuario_id', userId)
        .maybeSingle();

      if (existing) {
        // Actualizar configuración existente
        const { data, error } = await supabase
          .from('umbrales_pozo')
          .update(umbrales)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Umbrales del pozo actualizados correctamente",
        });
        
        return data;
      } else {
        // Crear nueva configuración para este pozo
        const newUmbral = {
          pozo_id: pozoId,
          usuario_id: userId,
          ...umbrales
        };
        
        const { data, error } = await supabase
          .from('umbrales_pozo')
          .insert(newUmbral)
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Umbrales del pozo creados correctamente",
        });
        
        return data;
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
