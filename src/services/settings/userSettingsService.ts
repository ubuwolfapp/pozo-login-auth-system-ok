
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { UserSettings } from "./types";

export const userSettingsService = {
  async getUserSettings(): Promise<UserSettings | null> {
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
          openai_activo: false,
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
      
      // Ensure all fields have proper defaults
      const settingsWithDefaults = {
        ...settings,
        umbral_temperatura: settings.umbral_temperatura ?? 85,
        umbral_flujo: settings.umbral_flujo ?? 600,
        simulacion_activa: settings.simulacion_activa ?? true,
        openai_activo: settings.openai_activo ?? false
      };
      
      return settingsWithDefaults as UserSettings;
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

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings | null> {
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

      const updateData = { ...settings };
      
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
          openai_activo: false,
          ...updateData
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
        if ('openai_activo' in settings) {
          console.log("Updating openai_activo to:", settings.openai_activo);
        }

        const { data, error } = await supabase
          .from('configuracion_usuario')
          .update(updateData)
          .eq('usuario_id', userId)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Configuración actualizada correctamente",
        });

        // Ensure all fields have proper defaults in the returned data
        const completeSettings = {
          ...data,
          umbral_temperatura: data.umbral_temperatura ?? 85,
          umbral_flujo: data.umbral_flujo ?? 600,
          simulacion_activa: data.simulacion_activa ?? true,
          openai_activo: 'openai_activo' in settings ? settings.openai_activo : (data.openai_activo ?? false)
        };
        
        return completeSettings as UserSettings;
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
  }
};
