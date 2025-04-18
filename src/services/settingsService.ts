
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
  idioma: string;
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
  }
};
