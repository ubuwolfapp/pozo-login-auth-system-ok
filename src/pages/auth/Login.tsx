
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
  };

  return (
    <AuthLayout title="Iniciar Sesión">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-white">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-opacity-20 bg-black backdrop-blur-md text-white"
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-white">Contraseña</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-opacity-20 bg-black backdrop-blur-md text-white"
            placeholder="********"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700"
          disabled={isLoading}
        >
          {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
        </Button>

        <p className="text-center text-white mt-4">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            onClick={() => navigate('/auth/register')}
            className="text-orange-500 hover:underline"
          >
            Regístrate
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
