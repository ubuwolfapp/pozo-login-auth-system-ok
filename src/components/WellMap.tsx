import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Token público de ejemplo para desarrollo. En producción, usar las variables de entorno.
let MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

interface Well {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  estado: string;
  produccion_diaria: number;
}

interface MapConfig {
  centro_latitud: number;
  centro_longitud: number;
  zoom_inicial: number;
}

const DEFAULT_MAP_CONFIG: MapConfig = {
  centro_latitud: 19.4326,
  centro_longitud: -99.1332,
  zoom_inicial: 5
};

const WellMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [storedToken, setStoredToken] = useState(() => {
    return localStorage.getItem('mapbox_token') || '';
  });

  // Usa el token almacenado si existe
  useEffect(() => {
    if (storedToken) {
      MAPBOX_TOKEN = storedToken;
    }
  }, [storedToken]);

  const { data: mapConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['mapConfig'],
    queryFn: async () => {
      try {
        // Permitir acceso no autenticado para cargar la configuración
        const { data, error } = await supabase
          .from('pozos_mapa')
          .select('*')
          .limit(1)
          .single();
        
        if (error) {
          console.error("Error cargando configuración del mapa:", error);
          return DEFAULT_MAP_CONFIG;
        }
        
        console.log("Configuración del mapa cargada:", data);
        return data as MapConfig;
      } catch (e) {
        console.error("Excepción al cargar configuración del mapa:", e);
        return DEFAULT_MAP_CONFIG;
      }
    }
  });

  const { data: wells, isLoading: isLoadingWells, refetch: refetchWells } = useQuery({
    queryKey: ['wells'],
    queryFn: async () => {
      try {
        // Permitir acceso público para lectura de pozos
        const { data, error } = await supabase
          .from('pozos')
          .select('*');
        
        if (error) {
          console.error("Error cargando datos de pozos:", error);
          return [];
        }
        
        console.log("Datos de pozos para el mapa:", data);
        return data as Well[];
      } catch (e) {
        console.error("Excepción al cargar datos de pozos:", e);
        return [];
      }
    }
  });

  useEffect(() => {
    if (!mapContainer.current || !mapConfig) return;
    
    console.log("Inicializando mapa con configuración:", mapConfig);

    try {
      // Limpiar cualquier mapa existente
      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      // Establecer token de Mapbox
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [mapConfig.centro_longitud, mapConfig.centro_latitud],
        zoom: mapConfig.zoom_inicial
      });

      map.current.on('error', (e) => {
        console.error("Error en el mapa:", e);
        setMapError("Error al cargar el mapa. Verifica la conexión y el token de Mapbox.");
        setShowTokenDialog(true);
      });

      map.current.on('load', () => {
        setMapError(null);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (e) {
      console.error("Error al inicializar el mapa:", e);
      setMapError("No se pudo inicializar el mapa. Verifica la configuración.");
      setShowTokenDialog(true);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapConfig, storedToken]);

  useEffect(() => {
    if (!map.current || !wells || wells.length === 0) return;
    
    console.log("Agregando marcadores de pozos al mapa:", wells.length);
    
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    wells.forEach(well => {
      try {
        const el = document.createElement('div');
        el.className = 'well-marker relative';
        
        el.innerHTML = `
          <div class="flex flex-col items-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#F97316">
              <path d="M12 2L8 6h3v6l-2 3v7h6v-7l-2-3V6h3L12 2z" />
              <path d="M5 10h2v2H5zM17 10h2v2h-2zM5 14h2v2H5zM17 14h2v2h-2z" />
            </svg>
            <div class="text-white font-bold text-xs text-center whitespace-nowrap text-shadow">${well.nombre}</div>
          </div>
        `;

        const statusColor = well.estado === 'activo' ? '#10B981' : 
                            well.estado === 'advertencia' ? '#F59E0B' : '#EF4444';
        
        if (well.estado !== 'activo') {
          const statusIndicator = document.createElement('div');
          statusIndicator.style.position = 'absolute';
          statusIndicator.style.top = '5px';
          statusIndicator.style.right = '-5px';
          statusIndicator.style.width = '12px';
          statusIndicator.style.height = '12px';
          statusIndicator.style.backgroundColor = statusColor;
          statusIndicator.style.borderRadius = '50%';
          statusIndicator.style.border = '2px solid #1C2526';
          el.appendChild(statusIndicator);
        }

        const marker = new mapboxgl.Marker(el)
          .setLngLat([well.longitud, well.latitud])
          .addTo(map.current!);
          
        markersRef.current.push(marker);
      } catch (e) {
        console.error("Error al crear marcador:", e);
      }
    });
  }, [wells, map.current]);

  const handleSaveToken = () => {
    if (tempToken) {
      localStorage.setItem('mapbox_token', tempToken);
      setStoredToken(tempToken);
      setShowTokenDialog(false);
      
      // Reintentar cargar el mapa
      if (mapConfig) {
        console.log("Reinicializando mapa con nuevo token");
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      }
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .text-shadow {
        text-shadow: 0px 0px 3px #000, 0px 0px 3px #000;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Función para reinicializar datos de prueba
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

  const isLoading = isLoadingConfig || isLoadingWells;

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-800">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Cargando mapa...</p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center text-white p-4 max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-lg font-medium mb-2">Error en el mapa</p>
            <p className="text-sm mb-4">{mapError}</p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full bg-pozo-orange hover:bg-orange-600 text-white"
                onClick={() => setShowTokenDialog(true)}
              >
                Configurar token de Mapbox
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleInitializeTestData}
              >
                Inicializar datos de prueba
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isLoading && wells && wells.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white p-4 max-w-md mx-auto">
            <p className="mb-4">No hay pozos para mostrar en el mapa</p>
            <Button 
              variant="outline" 
              className="bg-pozo-orange hover:bg-orange-600 text-white"
              onClick={handleInitializeTestData}
            >
              Inicializar datos de prueba
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar token de Mapbox</DialogTitle>
            <DialogDescription>
              Introduce tu token público de Mapbox para visualizar los mapas correctamente.
              Puedes obtener uno gratis en <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-pozo-orange hover:underline">mapbox.com</a>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Introduce el token de Mapbox..."
              value={tempToken}
              onChange={(e) => setTempToken(e.target.value)}
            />
            <div className="flex justify-end">
              <Button 
                className="bg-pozo-orange hover:bg-orange-600 text-white"
                onClick={handleSaveToken}
                disabled={!tempToken}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WellMap;
