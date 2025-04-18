
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    rol: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signUp(formData.email, formData.password, formData.nombre, formData.rol);
    setIsLoading(false);
  };

  return (
    <AuthLayout title="Registro">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-white">Nombre</label>
          <Input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
            className="bg-opacity-20 bg-black backdrop-blur-md text-white"
            placeholder="Tu nombre completo"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-white">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="bg-opacity-20 bg-black backdrop-blur-md text-white"
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-white">Contraseña</label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="bg-opacity-20 bg-black backdrop-blur-md text-white"
            placeholder="********"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-white">Rol</label>
          <Select
            value={formData.rol}
            onValueChange={(value) => setFormData(prev => ({ ...prev, rol: value }))}
          >
            <SelectTrigger className="bg-opacity-20 bg-black backdrop-blur-md text-white">
              <SelectValue placeholder="Selecciona tu rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ingeniero">Ingeniero</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700"
          disabled={isLoading}
        >
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </Button>

        <p className="text-center text-white mt-4">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="text-orange-500 hover:underline"
          >
            Inicia sesión
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
