
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WellMap from '@/components/WellMap';
import { Home, Bell, BarChart3, FileText, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: wells } = useQuery({
    queryKey: ['wells'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pozos')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

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

  const handleGenerateReport = () => {
    toast({
      title: "Generando reporte",
      description: "El reporte se está generando..."
    });
  };

  return (
    <div className="min-h-screen bg-[#1C2526] text-white">
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Monitoreo de Pozos</h1>
        
        {/* Mapa */}
        <div className="mb-6 bg-[#2E3A59] rounded-lg overflow-hidden h-[300px]">
          <WellMap />
        </div>
        
        {/* Lista de pozos */}
        <div className="space-y-3">
          {wells?.map((well) => (
            <div 
              key={well.id} 
              className="bg-[#2E3A59] p-4 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-pozo-orange">
                  <path d="M12 22l-3-3H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-4l-3 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <h3 className="font-medium">{well.nombre}</h3>
                  <p className="text-sm text-gray-400">{well.produccion_diaria} barriles/día</p>
                </div>
              </div>
              
              {well.estado === 'advertencia' && (
                <div className="text-yellow-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botón de generar reporte */}
        <button
          onClick={handleGenerateReport}
          className="w-full bg-pozo-orange text-white py-3 rounded-lg mt-6 font-medium"
        >
          Generar Reporte
        </button>

        {/* Barra de navegación inferior */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#2E3A59] px-6 py-4">
          <div className="flex justify-between items-center max-w-md mx-auto">
            <Home className="text-gray-400 h-6 w-6" />
            <Bell className="text-gray-400 h-6 w-6" />
            <BarChart3 className="text-gray-400 h-6 w-6" />
            <FileText className="text-gray-400 h-6 w-6" />
            <Settings className="text-gray-400 h-6 w-6" />
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Dashboard;
