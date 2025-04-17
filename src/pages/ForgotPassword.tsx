
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import EmailInput from '@/components/EmailInput';
import LoginButton from '@/components/LoginButton';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para validar el email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar el email
    if (!validateEmail(email)) {
      setError('Por favor, ingrese un email válido');
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(email);
      
      toast({
        title: 'Solicitud enviada',
        description: 'Si existe una cuenta asociada a este email, recibirá instrucciones para restablecer su contraseña',
      });
      
      // Volver a la página de login después de unos segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Función para volver a la página de login
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center font-roboto"
      style={{
        background: 'linear-gradient(to bottom, #1C2526, #2E3A59)',
        position: 'relative',
      }}
    >
      {/* Contenedor de la pantalla */}
      <div className="w-full max-w-md px-6 z-10">
        {/* Logo y título */}
        <div className="mb-12">
          <Logo />
        </div>
        
        <h2 className="text-white text-2xl font-bold mb-6">Recuperar Contraseña</h2>
        
        {/* Formulario de recuperación de contraseña */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-500 bg-opacity-20 text-white rounded p-3 text-sm">
              {error}
            </div>
          )}
          
          {/* Instrucciones */}
          <p className="text-white mb-4">
            Ingrese su correo electrónico y le enviaremos instrucciones para restablecer su contraseña.
          </p>
          
          {/* Campo de usuario (email) */}
          <div className="space-y-2">
            <label className="block text-white text-lg">Correo Electrónico</label>
            <EmailInput 
              value={email}
              onChange={setEmail}
              placeholder="juan.perez@empresa.com"
            />
          </div>
          
          {/* Botón de enviar */}
          <div className="pt-4">
            <LoginButton loading={loading} />
          </div>
          
          {/* Enlace para volver al login */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="text-white hover:underline text-center w-full py-2"
            >
              Volver al Inicio de Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
