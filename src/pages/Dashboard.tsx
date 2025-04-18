
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import GoogleMapsWell from '@/components/GoogleMapsWell';
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

  const handleInitializeTestData = async () => {
    try {
      // Crear pozos de ejemplo si no existen
      const { data: wellsData, error: wellsError } = await supabase
        .from('pozos')
        .select('*');
        
      if (!wellsData || wellsData.length === 0) {
        const exampleWells = [
          {
            nombre: 'Pozo Alpha',
            latitud: 19.4326,
            longitud: -99.1332,
            estado: 'activo',
            produccion_diaria: 1250,
            temperatura: 85,
            presion: 2100,
            flujo: 450,
            nivel: 75
          },
          {
            nombre: 'Pozo Beta',
            latitud: 19.4526,
            longitud: -99.1532,
            estado: 'advertencia',
            produccion_diaria: 980,
            temperatura: 92,
            presion: 1950,
            flujo: 380,
            nivel: 65
          },
          {
            nombre: 'Pozo Gamma',
            latitud: 19.4126,
            longitud: -99.1132,
            estado: 'fuera_de_servicio',
            produccion_diaria: 0,
            temperatura: 65,
            presion: 850,
            flujo: 0,
            nivel: 20
          }
        ];
        
        for (const well of exampleWells) {
          await supabase
            .from('pozos')
            .insert([well]);
        }
        
        toast({
          title: "Datos de pozos inicializados",
          description: "Se han creado pozos de ejemplo correctamente"
        });
        
        // Recargar datos
        refetch();
      } else {
        toast({
          title: "Datos existentes",
          description: "Ya existen pozos en la base de datos"
        });
      }
    } catch (e) {
      console.error("Error al inicializar datos de prueba:", e);
      toast({
        title: "Error",
        description: "No se pudieron crear los datos de prueba",
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
          <GoogleMapsWell wells={wells || []} />
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
              <p className="text-sm text-gray-400 mb-4">Para visualizar el mapa, necesitas añadir datos de pozos</p>
              <Button 
                variant="outline" 
                className="bg-pozo-orange hover:bg-orange-600 text-white"
                onClick={handleInitializeTestData}
              >
                Inicializar datos de prueba
              </Button>
            </div>
          )}
        </div>

        {wells && wells.length > 0 && (
          <Button
            onClick={handleGenerateReport}
            className="w-full bg-pozo-orange hover:bg-orange-600 text-white py-3 rounded-lg mt-6 font-medium text-lg"
          >
            Generar Reporte
          </Button>
        )}

        <NavigationBar />
      </div>
    </div>
  );
};

export default Dashboard;
