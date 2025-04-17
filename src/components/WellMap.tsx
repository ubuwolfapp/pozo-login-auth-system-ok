
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

const WellMap: React.FC = () => {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);

  const { data: mapConfig } = useQuery({
    queryKey: ['mapConfig'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pozos_mapa')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
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

    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHM3Y3c5YnIwbG5nMmptbG1rdWt1dTh2In0.Y4RZAA6EwQtlQcU_6JMwtg';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [mapConfig.centro_longitud, mapConfig.centro_latitud],
      zoom: mapConfig.zoom_inicial
    });

    // Add navigation control to the map
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [mapConfig]);

  React.useEffect(() => {
    if (!map.current || !wells) return;
    
    // Clear any existing markers
    const markers = document.querySelectorAll('.well-marker');
    markers.forEach(marker => marker.remove());

    wells.forEach(well => {
      const el = document.createElement('div');
      el.className = 'well-marker';
      
      // Custom oil well marker with tower icon
      el.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#F97316">
            <path d="M12 2L8 6h3v6l-2 3v7h6v-7l-2-3V6h3L12 2z" />
            <path d="M5 10h2v2H5zM17 10h2v2h-2zM5 14h2v2H5zM17 14h2v2h-2z" />
          </svg>
          <div style="color: white; font-weight: bold; text-shadow: 0 0 3px black;">${well.nombre}</div>
        </div>
      `;

      const statusColor = well.estado === 'activo' ? '#10B981' : 
                        well.estado === 'advertencia' ? '#F59E0B' : '#EF4444';
      
      // Add status indicator dot next to well name
      if (well.estado !== 'activo') {
        const statusDot = document.createElement('div');
        statusDot.style.width = '12px';
        statusDot.style.height = '12px';
        statusDot.style.borderRadius = '50%';
        statusDot.style.backgroundColor = statusColor;
        statusDot.style.position = 'absolute';
        statusDot.style.right = '-5px';
        statusDot.style.top = '12px';
        el.appendChild(statusDot);
      }

      new mapboxgl.Marker(el)
        .setLngLat([well.longitud, well.latitud])
        .addTo(map.current);
    });
  }, [wells, map.current]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default WellMap;
