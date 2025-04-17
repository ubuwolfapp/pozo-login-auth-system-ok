
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

    return () => {
      map.current?.remove();
    };
  }, [mapConfig]);

  React.useEffect(() => {
    if (!map.current || !wells) return;

    wells.forEach(well => {
      const el = document.createElement('div');
      el.className = 'well-marker';
      
      // Custom SVG marker for oil well
      el.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 22l-3-3H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-4l-3 3z" 
                fill="#F97316" 
                stroke="#F97316" 
                stroke-width="2"/>
        </svg>
      `;

      const statusColor = well.estado === 'activo' ? '#10B981' : 
                         well.estado === 'advertencia' ? '#F59E0B' : '#EF4444';

      new mapboxgl.Marker(el)
        .setLngLat([well.longitud, well.latitud])
        .setPopup(new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-3 bg-slate-800 text-white rounded-lg">
              <h3 class="font-bold">${well.nombre}</h3>
              <p class="text-sm">Producción: ${well.produccion_diaria} bbl/día</p>
              <div class="flex items-center mt-2">
                <span class="w-2 h-2 rounded-full mr-2" style="background-color: ${statusColor}"></span>
                <span class="text-sm">${well.estado}</span>
              </div>
            </div>
          `))
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
