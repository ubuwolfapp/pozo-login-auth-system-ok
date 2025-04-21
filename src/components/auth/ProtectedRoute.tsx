
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Configurar el listener de cambio de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Estado de autenticación cambiado:', event);
        if (session?.user) {
          // Buscar datos del usuario en la tabla usuarios
          try {
            const { data } = await supabase
              .from('usuarios')
              .select('id, email, nombre, rol')
              .eq('email', session.user.email)
              .maybeSingle();
            
            setUser(data);
          } catch (error) {
            console.error('Error buscando usuario:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Verificar sesión actual al cargar el componente
    const checkCurrentSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Buscar datos del usuario en la tabla usuarios
          const { data } = await supabase
            .from('usuarios')
            .select('id, email, nombre, rol')
            .eq('email', session.user.email)
            .maybeSingle();
          
          setUser(data);
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
      }
      setIsLoading(false);
    };

    checkCurrentSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Alternativa más simple para entornos de prueba
  const checkUserManual = async () => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setUser(data);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error en verificación manual:', error);
    }
    setIsLoading(false);
  };

  // Si estamos cargando, mostrar un spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Si no hay usuario, redireccionar a login
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Si hay usuario, mostrar la ruta protegida
  return <>{children}</>;
};

export default ProtectedRoute;
