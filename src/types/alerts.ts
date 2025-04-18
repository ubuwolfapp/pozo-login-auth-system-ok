
import { Database } from '@/integrations/supabase/types';

export type AlertType = 'critica' | 'advertencia';

export interface Alert {
  id: string;
  tipo: AlertType;
  mensaje: string;
  created_at: string;
  resuelto: boolean;
  pozo: {
    nombre: string;
  };
  unidad?: string | null;
  valor?: number | null;
}

export type AlertFromDatabase = Database['public']['Tables']['alertas']['Row'] & {
  pozo: {
    nombre: string;
  };
};
