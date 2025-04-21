
import { supabase } from "@/integrations/supabase/client";

export interface AppUser {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}

export const userService = {
  async getAllUsers(): Promise<AppUser[]> {
    // Primero intentamos obtener usuarios de la tabla usuarios
    const { data: usuariosData, error: usuariosError } = await supabase
      .from("usuarios")
      .select("id, email, nombre, rol")
      .order("nombre");

    if (usuariosError) {
      console.error("Error al obtener usuarios:", usuariosError);
    }

    // Si encontramos usuarios, los retornamos
    if (usuariosData && usuariosData.length > 0) {
      return usuariosData;
    }

    // Si no hay usuarios en la tabla usuarios, intentamos consultar auth.users
    // Nota: Esto puede requerir permisos adecuados y RLS configurado
    console.log("No se encontraron usuarios en tabla usuarios, verificando usuarios autenticados...");
    
    try {
      // Si no tenemos acceso a auth.users directamente, podemos usar una tabla de perfiles
      // o una función RPC para obtener usuarios autenticados
      const { data: authUsers, error: authError } = await supabase
        .from("auth.users")
        .select("id, email");

      if (authError) {
        console.error("Error al obtener usuarios autenticados:", authError);
        return [];
      }

      // Convertimos los usuarios auth a formato AppUser
      if (authUsers && authUsers.length > 0) {
        return authUsers.map(user => ({
          id: 0, // No tenemos ID numérico pero necesitamos algo
          email: user.email || "",
          nombre: user.email?.split('@')[0] || "Usuario",
          rol: "usuario"
        }));
      }
    } catch (e) {
      console.error("Error al consultar usuarios autenticados:", e);
    }

    // Si todo falla, retornamos un array vacío
    return [];
  },
};
