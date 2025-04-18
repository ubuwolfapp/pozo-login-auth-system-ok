
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    nombre: string;
    rol: string;
  };
}

export interface SignupCredentials {
  email: string;
  password: string;
  nombre: string;
  rol: string;
}

export const authService = {
  // Método para iniciar sesión sin verificación de contraseña (para testing)
  async login({ email, password }: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log("Intentando iniciar sesión con:", email, password);
      
      // Buscar usuario por email, sin verificar contraseña
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, nombre, rol, password')
        .eq('email', email)
        .single();

      if (error || !data) {
        console.error("Error al buscar usuario:", error);
        throw new Error('Usuario no encontrado');
      }
      
      console.log("Usuario encontrado:", data);
      
      // Para testing, solo verificamos que la contraseña coincida como texto plano
      if (data.password !== password) {
        console.error("Contraseña incorrecta");
        throw new Error('Contraseña incorrecta');
      }

      // Iniciar sesión en Supabase (aunque no usamos su autenticación directamente)
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Ignoramos errores de autenticación de Supabase para testing
      if (signInError) {
        console.warn("Error de autenticación Supabase (ignorado para testing):", signInError);
      }

      // Retornar datos del usuario
      return {
        user: {
          id: data.id || 'test-id',
          email: data.email,
          nombre: data.nombre,
          rol: data.rol
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de conexión';
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw error;
    }
  },

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!supabase.auth.getSession();
  },

  // Método para cerrar sesión
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  // Método para recuperar contraseña
  async forgotPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al enviar el correo';
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw error;
    }
  },

  // Método para registrar un nuevo usuario
  async signup({ email, password, nombre, rol }: SignupCredentials): Promise<LoginResponse> {
    try {
      // Registrar usuario en Supabase Auth
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signupError || !authData.user) {
        throw new Error(signupError?.message || 'Error al registrar usuario');
      }

      // Insertar datos adicionales en la tabla usuarios
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          email,
          nombre,
          rol,
          password // Include password field in the insert
        });

      if (insertError) {
        throw new Error(insertError.message || 'Error al guardar datos de usuario');
      }

      // Mostrar mensaje de éxito
      toast({
        title: "Registro exitoso",
        description: "Usuario registrado correctamente"
      });

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || '',
          nombre,
          rol
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de registro';
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      throw error;
    }
  }
};

export default authService;
