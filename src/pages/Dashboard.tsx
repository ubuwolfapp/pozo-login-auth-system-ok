
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente"
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive"
      });
    }
  };

  return (
    <div 
      className="min-h-screen font-roboto"
      style={{
        background: 'linear-gradient(to bottom, #1C2526, #2E3A59)',
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-white text-2xl font-bold">Dashboard - Monitoreo de Pozos</h1>
          <button
            onClick={handleLogout}
            className="bg-pozo-orange hover:bg-opacity-90 text-white px-4 py-2 rounded-md"
          >
            Cerrar Sesión
          </button>
        </div>
        
        <div className="bg-white bg-opacity-10 backdrop-blur-sm p-6 rounded-lg">
          <h2 className="text-white text-xl font-semibold mb-4">Bienvenido al Sistema de Monitoreo</h2>
          <p className="text-white">
            Esta es una página de demostración del dashboard. En una implementación completa, 
            aquí se mostrarían los datos de monitoreo de pozos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
