
import { supabase } from "@/integrations/supabase/client";

export interface AppUser {
  id: number | string;
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

    // Almacenamos los usuarios de la tabla pública
    const publicUsers: AppUser[] = usuariosData?.map(user => ({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol
    })) || [];
    
    // Si hay usuarios en la tabla pública, los retornamos sin consultar auth
    if (publicUsers.length > 0) {
      console.log("Usuarios encontrados en tabla pública:", publicUsers);
      return publicUsers;
    }

    console.log("No se encontraron usuarios en tabla pública, consultando usuarios autenticados...");
    
    try {
      // Obtenemos todos los usuarios autenticados (requiere privilegios de admin en función RPC)
      // Esto solo funcionará si tenemos una función RPC configurada o usamos el cliente admin
      const { data: authUsersData, error: authError } = await supabase.rpc('get_all_auth_users');
      
      if (authError) {
        console.error("Error al obtener usuarios autenticados via RPC:", authError);
        console.log("Intentando obtener al menos el usuario actual");
        
        // Si falla la RPC, al menos intentamos obtener el usuario actual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const currentUser = session.user;
          console.log("Usuario actual encontrado:", currentUser);
          
          return [{
            id: currentUser.id,
            email: currentUser.email || "usuario@example.com",
            nombre: currentUser.email?.split('@')[0] || "Usuario",
            rol: "usuario"
          }];
        }
      }
      
      if (authUsersData && authUsersData.length > 0) {
        console.log("Usuarios autenticados encontrados via RPC:", authUsersData);
        return authUsersData.map((user: any) => ({
          id: user.id,
          email: user.email || "",
          nombre: user.email?.split('@')[0] || "Usuario",
          rol: "usuario"
        }));
      }
      
      // Si no pudimos obtener usuarios de ningún lado, devolver al menos un usuario de ejemplo
      console.log("No se encontraron usuarios, devolviendo usuario de ejemplo");
      return [{
        id: 0,
        email: "usuario@example.com",
        nombre: "Usuario",
        rol: "usuario"
      }];
    } catch (e) {
      console.error("Error al verificar usuarios autenticados:", e);
    }

    // Si todo falla, retornamos un array vacío
    return [];
  },
  
  // Este método se puede utilizar para guardar un usuario en la tabla pública
  async createPublicUser(user: { email: string, nombre: string, rol: string }): Promise<AppUser | null> {
    const { data, error } = await supabase
      .from("usuarios")
      .insert({
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        password: 'temporal123' // Esto es solo para cumplir con la estructura de la tabla
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error al crear usuario público:", error);
      return null;
    }
    
    return data as AppUser;
  }
};
