import React, { useState } from 'react';
import { Well } from '@/services/wellService';
import { Factory } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { useMapbox } from '@/hooks/useMapbox';
import MapTokenDialog from '@/components/maps/MapTokenDialog';
import MapLoading from '@/components/maps/MapLoading';
import MapError from '@/components/maps/MapError';
import MapEmptyState from '@/components/maps/MapEmptyState';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface WellMapProps {
  wells: Well[];
  onSelectWell: (well: Well) => void;
}

let MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

const WellMap: React.FC<WellMapProps> = ({ wells, onSelectWell }) => {
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [storedToken, setStoredToken] = useState(() => {
    return localStorage.getItem('mapbox_token') || '';
  });

  // Use stored token if it exists
  if (storedToken) {
    MAPBOX_TOKEN = storedToken;
  }

  // Set Mapbox token
  mapboxgl.accessToken = MAPBOX_TOKEN;

  const { mapContainer, map, mapError } = useMapbox({
    centro_latitud: 19.4326,
    centro_longitud: -99.1332,
    zoom_inicial: 5
  });

  const handleSaveToken = () => {
    if (tempToken) {
      localStorage.setItem('mapbox_token', tempToken);
      setStoredToken(tempToken);
      setShowTokenDialog(false);
    }
  };

  const handleInitializeTestData = async () => {
    try {
      // Crear configuración del mapa si no existe
      const { data: mapData, error: mapError } = await supabase
        .from('pozos_mapa')
        .select('*');
      
      if (!mapData || mapData.length === 0) {
        await supabase
          .from('pozos_mapa')
          .insert({
            nombre: 'Configuración por defecto',
            centro_latitud: 19.4326,
            centro_longitud: -99.1332,
            zoom_inicial: 5
          });
      }
      
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
      }
      
      // Recargar datos
      refetchWells();
    } catch (e) {
      console.error("Error al inicializar datos de prueba:", e);
    }
  };

  // Función para obtener color según estado
  const getStatusColor = (estado: string): string => {
    switch (estado) {
      case 'activo':
        return 'bg-green-500';
      case 'advertencia':
        return 'bg-yellow-500';
      case 'fuera_de_servicio':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Función para obtener color de texto según estado
  const getStatusTextColor = (estado: string): string => {
    switch (estado) {
      case 'activo':
        return 'text-green-500';
      case 'advertencia':
        return 'text-yellow-500';
      case 'fuera_de_servicio':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="relative w-full h-[50vh] rounded-lg overflow-hidden bg-slate-800">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {!map.current && <MapLoading />}
      
      {mapError && (
        <MapError 
          error={mapError} 
          onRetry={() => setShowTokenDialog(true)} 
        />
      )}

      {!mapError && wells && wells.length === 0 && <MapEmptyState />}

      <MapTokenDialog 
        open={showTokenDialog}
        onOpenChange={setShowTokenDialog}
        tempToken={tempToken}
        onTokenChange={setTempToken}
        onSave={handleSaveToken}
      />

      <TooltipProvider>
        {wells.map((well) => {
          // Calcular posiciones relativas basadas en un grid
          const gridX = (parseInt(well.id, 36) % 5) / 5;
          const gridY = (parseInt(well.id.slice(-2), 36) % 8) / 8;
          
          return (
            <div
              key={well.id}
              className="absolute cursor-pointer transform transition-transform hover:scale-110"
              style={{
                left: `${5 + gridX * 90}%`,
                top: `${10 + gridY * 80}%`
              }}
              onClick={() => onSelectWell(well)}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex flex-col items-center">
                    <Factory
                      className={`h-8 w-8 ${getStatusTextColor(well.estado)}`}
                    />
                    <div className={`absolute -top-2 -right-2 w-3 h-3 ${getStatusColor(well.estado)} rounded-full border border-slate-800`}></div>
                    <div className="text-xs text-white font-medium mt-1">{well.nombre}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-800 border-slate-700 text-white">
                  <div className="text-sm font-bold">{well.nombre}</div>
                  <div className="text-xs text-slate-300">Producción: {well.produccion_diaria.toFixed(0)} bbls</div>
                  <div className="text-xs text-slate-300">
                    Estado: {well.estado === 'activo' ? 'Activo' : 
                            well.estado === 'advertencia' ? 'Advertencia' : 'Fuera de servicio'}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </TooltipProvider>
    </div>
  );
};

export default WellMap;
