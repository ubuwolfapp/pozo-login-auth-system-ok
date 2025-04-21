
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { userService } from '@/services/userService';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Si el usuario ha iniciado sesión, intentar sincronizarlo con la tabla pública
        if (currentUser && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
          try {
            await userService.syncAuthUserToPublic(currentUser);
          } catch (error) {
            console.error("Error al sincronizar usuario con tabla pública:", error);
          }
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Si hay un usuario activo, sincronizarlo con la tabla pública
      if (currentUser) {
        try {
          await userService.syncAuthUserToPublic(currentUser);
        } catch (error) {
          console.error("Error al sincronizar usuario con tabla pública:", error);
        }
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const signUp = async (email: string, password: string, nombre: string, rol: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            rol,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Registro exitoso",
        description: "Se ha enviado un correo de confirmación a tu email.",
      });
      
      // Crear el usuario también en la tabla pública
      try {
        await userService.createPublicUser({
          email,
          nombre,
          rol
        });
      } catch (syncError) {
        console.error("Error al crear usuario en tabla pública:", syncError);
      }
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth/login');
    } catch (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
};
