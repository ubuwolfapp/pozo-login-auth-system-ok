
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import WellMap from '@/components/WellMap';
import WellCard from '@/components/WellCard';
import { Home, Bell, BarChart3, FileText, Settings, CircleDollarSign } from 'lucide-react';

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
        
        {/* Mapa de pozos */}
        <div className="mb-8">
          <WellMap />
        </div>

        {/* Lista de pozos */}
        <div className="grid gap-4 mb-8">
          {wells?.map((well) => (
            <WellCard
              key={well.id}
              nombre={well.nombre}
              produccion_diaria={well.produccion_diaria}
              estado={well.estado}
            />
          ))}
        </div>

        {/* Botón de generar reporte */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleGenerateReport}
            className="bg-pozo-orange hover:bg-opacity-90 text-white px-8 py-3 rounded-md flex items-center gap-2"
          >
            <CircleDollarSign className="h-5 w-5" />
            Generar Reporte
          </Button>
        </div>

        {/* Barra de navegación inferior */}
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-4 py-3">
          <div className="container mx-auto flex justify-around items-center">
            <Button variant="ghost" className="text-white">
              <Home className="h-6 w-6" />
            </Button>
            <Button variant="ghost" className="text-white">
              <Bell className="h-6 w-6" />
            </Button>
            <Button variant="ghost" className="text-white">
              <BarChart3 className="h-6 w-6" />
            </Button>
            <Button variant="ghost" className="text-white">
              <FileText className="h-6 w-6" />
            </Button>
            <Button variant="ghost" className="text-white">
              <Settings className="h-6 w-6" />
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Dashboard;
