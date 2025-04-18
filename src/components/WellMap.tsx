
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

const WellMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Consulta de configuración del mapa
  const { data: mapConfig } = useQuery({
    queryKey: ['mapConfig'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('pozos_mapa')
          .select('*')
          .single();
        
        if (error) {
          console.error("Error cargando configuración del mapa:", error);
          // Valor predeterminado en caso de error
          return {
            centro_latitud: 19.4326,
            centro_longitud: -99.1332,
            zoom_inicial: 5
          } as MapConfig;
        }
        
        console.log("Configuración del mapa cargada:", data);
        return data as MapConfig;
      } catch (e) {
        console.error("Excepción al cargar configuración del mapa:", e);
        // Valor predeterminado en caso de error
        return {
          centro_latitud: 19.4326,
          centro_longitud: -99.1332,
          zoom_inicial: 5
        } as MapConfig;
      }
    }
  });

  // Consulta de datos de pozos
  const { data: wells } = useQuery({
    queryKey: ['wells'],
    queryFn: async () => {
      try {
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

  // Inicializar el mapa cuando la configuración está disponible
  useEffect(() => {
    if (!mapContainer.current || !mapConfig) return;
    
    console.log("Inicializando mapa con configuración:", mapConfig);

    // Token de Mapbox
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHM3Y3c5YnIwbG5nMmptbG1rdWt1dTh2In0.Y4RZAA6EwQtlQcU_6JMwtg';
    
    // Crear instancia del mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [mapConfig.centro_longitud, mapConfig.centro_latitud],
      zoom: mapConfig.zoom_inicial
    });

    // Agregar controles de navegación
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Limpiar al desmontar
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapConfig]);

  // Agregar marcadores cuando los datos de pozos estén disponibles
  useEffect(() => {
    if (!map.current || !wells || wells.length === 0) return;
    
    console.log("Agregando marcadores de pozos al mapa:", wells.length);
    
    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Crear marcadores para cada pozo
    wells.forEach(well => {
      // Elemento HTML para el marcador personalizado
      const el = document.createElement('div');
      el.className = 'well-marker relative';
      
      // Personalización del marcador
      el.innerHTML = `
        <div class="flex flex-col items-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#F97316">
            <path d="M12 2L8 6h3v6l-2 3v7h6v-7l-2-3V6h3L12 2z" />
            <path d="M5 10h2v2H5zM17 10h2v2h-2zM5 14h2v2H5zM17 14h2v2h-2z" />
          </svg>
          <div class="text-white font-bold text-xs text-center whitespace-nowrap text-shadow">${well.nombre}</div>
        </div>
      `;

      // Color según el estado del pozo
      const statusColor = well.estado === 'activo' ? '#10B981' : 
                          well.estado === 'advertencia' ? '#F59E0B' : '#EF4444';
      
      // Agregar indicador de estado si no está activo
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

      // Crear y añadir el marcador
      try {
        const marker = new mapboxgl.Marker(el)
          .setLngLat([well.longitud, well.latitud])
          .addTo(map.current!);
          
        // Guardar referencia para limpieza posterior
        markersRef.current.push(marker);
      } catch (e) {
        console.error("Error al crear marcador:", e);
      }
    });
  }, [wells, map.current]);

  // Agregar estilos CSS para el texto del marcador
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

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-800">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Overlay para indicar carga o falta de datos */}
      {!wells && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellMap;
