
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
      const { data: settings, error } = await supabase
        .from('configuracion_usuario')
        .select('*')
        .single();

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
      const { data, error } = await supabase
        .from('configuracion_usuario')
        .update(settings)
        .eq('usuario_id', (await supabase.auth.getUser()).data.user?.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Configuración actualizada correctamente",
      });
      
      return data;
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
