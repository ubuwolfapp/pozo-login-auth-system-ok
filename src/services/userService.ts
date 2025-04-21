
import { supabase } from "@/integrations/supabase/client";

export interface AppUser {
  id: number | string;
  email: string;
  nombre: string;
  rol: string;
}

export const userService = {
  async getAllUsers(): Promise<AppUser[]> {
    try {
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
      
      // Obtenemos el usuario actualmente autenticado
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      
      // Si el usuario actual existe y no está ya en la lista de usuarios públicos
      if (currentUser && !publicUsers.some(user => user.email === currentUser.email)) {
        // Añadir el usuario actual a la lista
        publicUsers.push({
          id: currentUser.id,
          email: currentUser.email || "usuario@example.com",
          nombre: currentUser.user_metadata?.nombre || currentUser.email?.split('@')[0] || "Usuario",
          rol: currentUser.user_metadata?.rol || "usuario"
        });
      }
      
      // Ordenar por nombre
      const allUsers = publicUsers.sort((a, b) => a.nombre.localeCompare(b.nombre));
      console.log("Lista completa de usuarios disponibles:", allUsers);
      
      // Si tenemos usuarios, los devolvemos
      if (allUsers.length > 0) {
        return allUsers;
      }
      
      // Si no hay usuarios, creamos uno de ejemplo
      return [{
        id: 0,
        email: "usuario@example.com",
        nombre: "Usuario",
        rol: "usuario"
      }];
    } catch (e) {
      console.error("Error al obtener usuarios:", e);
      // En caso de error, devolvemos al menos un usuario de ejemplo
      return [{
        id: 0,
        email: "usuario@example.com",
        nombre: "Usuario",
        rol: "usuario"
      }];
    }
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
  },
  
  // Nuevo método para sincronizar un usuario de Auth con la tabla pública
  async syncAuthUserToPublic(authUser: any): Promise<AppUser | null> {
    if (!authUser || !authUser.email) return null;
    
    // Verificar si el usuario ya existe en la tabla pública
    const { data: existingUser } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", authUser.email)
      .single();
      
    if (existingUser) {
      console.log("Usuario ya existe en tabla pública:", existingUser);
      return existingUser as AppUser;
    }
    
    // Si no existe, lo creamos en la tabla pública
    const nombre = authUser.user_metadata?.nombre || authUser.email.split('@')[0];
    const rol = authUser.user_metadata?.rol || "usuario";
    
    return this.createPublicUser({
      email: authUser.email,
      nombre,
      rol
    });
  }
};
