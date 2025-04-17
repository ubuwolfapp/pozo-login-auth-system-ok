
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import EmailInput from '@/components/EmailInput';
import PasswordInput from '@/components/PasswordInput';
import { Input } from '@/components/ui/input';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    rol: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.signup(formData);
      navigate('/dashboard');
    } catch (error) {
      // Error handling is already in authService
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center font-roboto"
      style={{
        background: 'linear-gradient(to bottom, #1C2526, #2E3A59)',
      }}
    >
      <div className="w-full max-w-md px-6 py-8 bg-slate-800 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Registro de Usuario</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-white">Email</label>
            <EmailInput
              value={formData.email}
              onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white">Contraseña</label>
            <PasswordInput
              value={formData.password}
              onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white">Nombre</label>
            <Input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              className="bg-opacity-20 bg-black backdrop-blur-md text-white"
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white">Rol</label>
            <Input
              type="text"
              value={formData.rol}
              onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value }))}
              className="bg-opacity-20 bg-black backdrop-blur-md text-white"
              placeholder="Ingeniero, Técnico, etc."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pozo-orange hover:bg-opacity-90 text-white font-bold py-3 rounded-md transition-colors mt-6"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <p className="text-center text-white mt-4">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-pozo-orange hover:underline"
            >
              Iniciar sesión
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
