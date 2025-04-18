
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import WellMap from '@/components/WellMap';
import WellCard from '@/components/WellCard';
import NavigationBar from '@/components/NavigationBar';

interface Well {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  estado: string;
  produccion_diaria: number;
}

const Dashboard: React.FC = () => {
  // Obtener datos de pozos
  const { data: wells, isLoading, error, refetch } = useQuery({
    queryKey: ['wells'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('pozos')
          .select('*');
        
        if (error) {
          console.error("Error cargando datos de pozos:", error);
          throw error;
        }
        
        console.log("Datos de pozos cargados:", data);
        return data as Well[];
      } catch (e) {
        console.error("Error en consulta de pozos:", e);
        throw e;
      }
    }
  });

  const handleGenerateReport = () => {
    toast({
      title: "Generando reporte",
      description: "El reporte se está generando..."
    });
  };

  const handleRetry = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#1C2526] text-white p-6 flex flex-col items-center justify-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error al cargar datos</h2>
        <p className="text-center mb-4">No se pudieron cargar los datos de los pozos</p>
        <Button onClick={handleRetry} variant="outline">
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
            <div className="space-y-3">
              <Skeleton className="h-24 w-full bg-[#2E3A59]" />
              <Skeleton className="h-24 w-full bg-[#2E3A59]" />
              <Skeleton className="h-24 w-full bg-[#2E3A59]" />
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
            <div className="text-center py-4 bg-[#2E3A59] rounded-lg p-4">
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

        <NavigationBar />
      </div>
    </div>
  );
};

export default Dashboard;
