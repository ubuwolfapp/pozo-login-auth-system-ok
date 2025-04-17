
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    nombre: string;
    rol: string;
  };
}

// Servicio de autenticación
export const authService = {
  // Método para iniciar sesión
  async login({ email, password }: LoginCredentials): Promise<LoginResponse> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, nombre, rol')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        throw new Error('Usuario o contraseña incorrectos');
      }

      // Set the session in Supabase
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error('Error al iniciar sesión');
      }

      return { user: data };
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
  }
};
