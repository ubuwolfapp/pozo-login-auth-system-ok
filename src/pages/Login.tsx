import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import EmailInput from '@/components/EmailInput';
import PasswordInput from '@/components/PasswordInput';
import LoginButton from '@/components/LoginButton';
import ForgotPasswordLink from '@/components/ForgotPasswordLink';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';

const loginBackground = {
  backgroundImage: 'url("/assets/oil-rig-background.png")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para validar el email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para manejar el inicio de sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar el email
    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Por favor, ingrese un email válido",
        variant: "destructive"
      });
      return;
    }

    // Validar la contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await authService.login({ email, password });
      
      // Mostrar mensaje de éxito
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema de Monitoreo de Pozos",
      });
      
      // Redireccionar al dashboard
      navigate('/dashboard');
    } catch (err) {
      // El manejo de errores ya está en el servicio
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center font-roboto"
      style={{
        background: 'linear-gradient(to bottom, #1C2526, #2E3A59)',
        position: 'relative',
      }}
    >
      {/* Fondo con silueta de pozo */}
      <div 
        className="absolute inset-0 opacity-20 z-0"
        style={loginBackground}
      ></div>
      
      {/* Contenedor de la pantalla de login */}
      <div className="w-full max-w-md px-6 z-10">
        {/* Logo y título */}
        <div className="mb-12">
          <Logo />
        </div>
        
        {/* Gráfico estilizado */}
        <div className="mb-10 px-8">
          <svg width="100%" height="80" viewBox="0 0 300 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="60" x2="300" y2="60" stroke="#3D8BFF" strokeWidth="1" strokeOpacity="0.3" />
            <text x="0" y="75" fill="#FFFFFF" fontSize="12">0</text>
            <text x="0" y="15" fill="#FFFFFF" fontSize="12">1</text>
            <path d="M0,40 C25,30 50,50 75,45 C100,40 125,20 150,25 C175,30 200,50 225,35 C250,20 275,40 300,30" 
                  stroke="#3D8BFF" strokeWidth="2" fill="none" />
          </svg>
        </div>
        
        {/* NUEVO: Imagen agregada arriba del formulario */}
        <div className="mb-6 flex justify-center">
          <img 
            src="/assets/login-image.png" 
            alt="Ilustración de inicio de sesión" 
            className="max-w-xs w-full"
          />
        </div>
        
        {/* Formulario de login */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Campo de usuario (email) */}
          <div className="space-y-2">
            <label className="block text-white text-lg">Usuario</label>
            <EmailInput 
              value={email}
              onChange={setEmail}
              placeholder="juan.perez@empresa.com"
            />
          </div>
          
          {/* Campo de contraseña */}
          <div className="space-y-2">
            <label className="block text-white text-lg">Contraseña</label>
            <PasswordInput 
              value={password}
              onChange={setPassword}
            />
          </div>
          
          {/* Botón de inicio de sesión */}
          <div className="pt-4">
            <LoginButton loading={loading} />
          </div>
          
          {/* Enlace para recuperar contraseña */}
          <div className="pt-2">
            <ForgotPasswordLink onClick={() => navigate('/forgot-password')} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;