
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Ensures a user exists in the public.usuarios table
  const syncUserToCustomTable = async (authUser) => {
    if (!authUser) return null;
    
    try {
      // Check if the user already exists in the custom table
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id, email, nombre, rol')
        .eq('email', authUser.email)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking user in custom table:', checkError);
        return null;
      }
      
      // If user exists, return it
      if (existingUser) {
        console.log('User found in custom table:', existingUser);
        return existingUser;
      }
      
      // If user doesn't exist, create it using metadata from auth user
      const nombre = authUser.user_metadata?.nombre || authUser.email.split('@')[0];
      const rol = authUser.user_metadata?.rol || 'usuario';
      
      const { data: newUser, error: insertError } = await supabase
        .from('usuarios')
        .insert({
          email: authUser.email,
          nombre: nombre,
          rol: rol,
          password: 'created-via-auth' // Placeholder, not used for authentication
        })
        .select('id, email, nombre, rol')
        .single();
      
      if (insertError) {
        console.error('Error creating user in custom table:', insertError);
        return null;
      }
      
      console.log('Created new user in custom table:', newUser);
      return newUser;
    } catch (error) {
      console.error('Error syncing user to custom table:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          // When user signs in or token refreshes, ensure they exist in custom table
          const customUser = await syncUserToCustomTable(session.user);
          setUser(customUser);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // When initial session check, ensure user exists in custom table
        const customUser = await syncUserToCustomTable(session.user);
        setUser(customUser);
      } else {
        setUser(null);
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
