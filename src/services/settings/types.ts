
import { Database } from "@/integrations/supabase/types";

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
  openai_activo: boolean;
  created_at?: string;
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
