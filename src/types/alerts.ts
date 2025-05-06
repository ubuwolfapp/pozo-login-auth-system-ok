
import { Database } from '@/integrations/supabase/types';

export type AlertType = 'todas' | 'critica' | 'advertencia' | 'resueltas';

export interface Alert {
  id: string;
  tipo: string;
  mensaje: string;
  created_at: string;
  resuelto: boolean;
  resolucion?: string;
  fecha_resolucion?: string;
  pozo: {
    id: string;
    nombre: string;
  };
  unidad?: string | null;
  valor?: number | null;
  foto_url?: string | null;
  doc_url?: string | null;
}

export type AlertFromDatabase = Database['public']['Tables']['alertas']['Row'] & {
  pozo: {
    nombre: string;
  };
};
