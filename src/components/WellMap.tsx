
import React from 'react';
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
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);
  const markers = React.useRef<mapboxgl.Marker[]>([]);

  const { data: mapConfig } = useQuery({
    queryKey: ['mapConfig'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pozos_mapa')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as MapConfig;
    }
  });

  const { data: wells } = useQuery({
    queryKey: ['wells'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pozos')
        .select('*');
      
      if (error) throw error;
      return data as Well[];
    }
  });

  React.useEffect(() => {
    if (!mapContainer.current || !mapConfig) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHM3Y3c5YnIwbG5nMmptbG1rdWt1dTh2In0.Y4RZAA6EwQtlQcU_6JMwtg';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [mapConfig.centro_longitud, mapConfig.centro_latitud],
      zoom: mapConfig.zoom_inicial
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [mapConfig]);

  React.useEffect(() => {
    if (!map.current || !wells) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each well
    wells.forEach(well => {
      const el = document.createElement('div');
      el.className = 'well-marker';
      
      // Set marker color based on well state
      const color = well.estado === 'activo' ? '#10B981' : 
                    well.estado === 'advertencia' ? '#F59E0B' : '#EF4444';
      
      el.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" fill="${color}"/>
        </svg>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([well.longitud, well.latitud])
        .setPopup(new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${well.nombre}</h3>
              <p>Producción: ${well.produccion_diaria} bbl/día</p>
              <p>Estado: ${well.estado}</p>
            </div>
          `))
        .addTo(map.current);

      markers.current.push(marker);
    });
  }, [wells, map.current]);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default WellMap;
