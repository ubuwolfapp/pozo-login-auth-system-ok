
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import WellMap from '@/components/WellMap';
import { Home, Bell, BarChart3, FileText, Settings, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Well {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  estado: string;
  produccion_diaria: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: wells, isLoading } = useQuery({
    queryKey: ['wells'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pozos')
        .select('*');
      
      if (error) {
        console.error("Error fetching wells:", error);
        throw error;
      }
      console.log("Wells data:", data);
      return data as Well[];
    }
  });

  // Agregar logs para verificar lo que está pasando con los datos
  React.useEffect(() => {
    console.log("Current wells data:", wells);
  }, [wells]);

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

  const getStateIcon = (estado: string) => {
    switch (estado) {
      case 'advertencia':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'fuera_de_servicio':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1C2526] text-white">
      <div className="px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">Monitoreo de Pozos</h1>
        
        <div className="mb-6 bg-[#2E3A59] rounded-lg overflow-hidden h-[300px]">
          <WellMap />
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">Cargando información de pozos...</div>
          ) : wells && wells.length > 0 ? (
            wells.map((well) => (
              <Card 
                key={well.id} 
                className="bg-[#2E3A59] border-none p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#F97316">
                    <path d="M12 2L8 6h3v6l-2 3v7h6v-7l-2-3V6h3L12 2z" />
                    <path d="M5 10h2v2H5zM17 10h2v2h-2zM5 14h2v2H5zM17 14h2v2h-2z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-lg">{well.nombre}</h3>
                    <p className="text-sm text-gray-300">{well.produccion_diaria} barriles/día</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {getStateIcon(well.estado)}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="#F97316" className="ml-2">
                    <path d="M12 2L8 6h3v6l-2 3v7h6v-7l-2-3V6h3L12 2z" />
                    <path d="M5 10h2v2H5zM17 10h2v2h-2zM5 14h2v2H5zM17 14h2v2h-2z" />
                  </svg>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-4">No hay datos de pozos disponibles</div>
          )}
        </div>

        <Button
          onClick={handleGenerateReport}
          className="w-full bg-pozo-orange hover:bg-orange-600 text-white py-3 rounded-lg mt-6 font-medium text-lg"
        >
          Generar Reporte
        </Button>

        <nav className="fixed bottom-0 left-0 right-0 bg-[#2E3A59] px-6 py-4">
          <div className="flex justify-between items-center max-w-md mx-auto">
            <Home className="text-pozo-orange h-6 w-6" />
            <Bell 
              className="text-gray-400 h-6 w-6 cursor-pointer hover:text-pozo-orange transition-colors" 
              onClick={() => navigate('/alerts')}
            />
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
