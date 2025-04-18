
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Home, Bell, BarChart3, FileText, Settings, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WellMap from '@/components/WellMap';
import WellCard from '@/components/WellCard';

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

  const { data: wells, isLoading, error } = useQuery({
    queryKey: ['wells'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pozos')
        .select('*');
      
      if (error) {
        console.error("Error cargando datos de pozos:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log("No se encontraron datos de pozos");
        return [];
      }
      
      console.log("Datos de pozos cargados:", data);
      return data as Well[];
    }
  });

  const handleGenerateReport = () => {
    toast({
      title: "Generando reporte",
      description: "El reporte se está generando..."
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#1C2526] text-white p-6 flex flex-col items-center justify-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error al cargar datos</h2>
        <p className="text-center mb-4">No se pudieron cargar los datos de los pozos</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C2526] text-white">
      <div className="px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold mb-6">Monitoreo de Pozos</h1>
        
        <div className="mb-6 bg-[#2E3A59] rounded-lg overflow-hidden h-[300px]">
          <WellMap />
        </div>
        
        <h2 className="text-xl font-semibold mb-3">Estado de los Pozos</h2>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
              <p>Cargando información de pozos...</p>
            </div>
          ) : wells && wells.length > 0 ? (
            wells.map((well) => (
              <WellCard 
                key={well.id}
                nombre={well.nombre}
                produccion_diaria={well.produccion_diaria}
                estado={well.estado}
              />
            ))
          ) : (
            <div className="text-center py-4">
              <p className="mb-2">No hay datos de pozos disponibles</p>
              <p className="text-sm text-gray-400">Asegúrate de que existan datos en la tabla de pozos</p>
            </div>
          )}
        </div>

        <Button
          onClick={handleGenerateReport}
          className="w-full bg-pozo-orange hover:bg-orange-600 text-white py-3 rounded-lg mt-6 font-medium text-lg"
        >
          Generar Reporte
        </Button>

        <nav className="fixed bottom-0 left-0 right-0 bg-[#2E3A59] px-6 py-4 shadow-lg">
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
