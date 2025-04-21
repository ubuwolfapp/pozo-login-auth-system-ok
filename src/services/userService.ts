
import { supabase } from "@/integrations/supabase/client";

export interface AppUser {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}

export const userService = {
  async getAllUsers(): Promise<AppUser[]> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, email, nombre, rol")
      .order("nombre");

    if (error) {
      console.error("Error al obtener usuarios:", error);
      return [];
    }
    return data || [];
  },
};
