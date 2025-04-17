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
  // Método para iniciar sesión usando autenticación de Supabase
  async login({ email, password }: LoginCredentials): Promise<LoginResponse> {
    try {
      // Usar signInWithPassword para autenticación segura
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError || !authData.user) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      // Obtener datos adicionales del usuario desde la tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('nombre, rol')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        throw new Error('Error al obtener datos del usuario');
      }

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || '',
          nombre: userData.nombre,
          rol: userData.rol
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
          id: authData.user.id,
          email,
          nombre,
          rol
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
