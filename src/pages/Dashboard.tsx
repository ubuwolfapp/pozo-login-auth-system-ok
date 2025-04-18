
import React, { useState } from 'react';
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

// Verificar si la tabla pozos_mapa está vacía y crear registro si es necesario
const initializeMapConfigIfNeeded = async () => {
  // Primero verificamos si existe la configuración del mapa
  const { data: existingConfig, error: checkError } = await supabase
    .from('pozos_mapa')
    .select('*');
    
  if (checkError) {
    console.error("Error verificando la configuración del mapa:", checkError);
    return;
  }
  
  // Si no hay configuración, creamos una por defecto
  if (!existingConfig || existingConfig.length === 0) {
    const { error: insertError } = await supabase
      .from('pozos_mapa')
      .insert({
        nombre: 'Configuración por defecto',
        centro_latitud: 19.4326,
        centro_longitud: -99.1332,
        zoom_inicial: 5
      });
      
    if (insertError) {
      console.error("Error creando configuración inicial del mapa:", insertError);
    } else {
      console.log("Configuración inicial del mapa creada correctamente");
    }
  }
};

const Dashboard: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);

  // Inicializar configuración del mapa si es necesario
  React.useEffect(() => {
    const initialize = async () => {
      await initializeMapConfigIfNeeded();
      setIsInitializing(false);
    };
    
    initialize();
  }, []);

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
      
      // Si no hay datos, crear algunos pozos de ejemplo
      if (!data || data.length === 0) {
        console.log("No se encontraron datos de pozos. Creando ejemplos...");
        
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
        
        // Insertar pozos de ejemplo
        for (const well of exampleWells) {
          const { error: insertError } = await supabase
            .from('pozos')
            .insert([well]);
          
          if (insertError) {
            console.error("Error creando pozo de ejemplo:", insertError);
          }
        }
        
        // Obtener los datos recién insertados
        const { data: newData, error: newError } = await supabase
          .from('pozos')
          .select('*');
          
        if (newError) {
          console.error("Error recargando datos de pozos:", newError);
          return [];
        }
        
        console.log("Datos de pozos de ejemplo creados:", newData);
        return newData as Well[];
      }
      
      console.log("Datos de pozos cargados:", data);
      return data as Well[];
    },
    enabled: !isInitializing // Solo habilitamos la consulta después de verificar la configuración del mapa
  });

  const handleGenerateReport = () => {
    toast({
      title: "Generando reporte",
      description: "El reporte se está generando..."
    });
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#1C2526] text-white p-6 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pozo-orange mx-auto mb-4"></div>
        <p className="text-center">Inicializando aplicación...</p>
      </div>
    );
  }

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
