
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapbox = (config: {
  centro_latitud: number;
  centro_longitud: number;
  zoom_inicial: number;
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [config.centro_longitud, config.centro_latitud],
        zoom: config.zoom_inicial
      });

      map.current.on('error', (e) => {
        console.error("Error en el mapa:", e);
        setMapError("Error al cargar el mapa. Verifica la conexión y el token de Mapbox.");
      });

      map.current.on('load', () => {
        setMapError(null);
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (e) {
      console.error("Error al inicializar el mapa:", e);
      setMapError("No se pudo inicializar el mapa. Verifica la configuración.");
    }

    // Safe cleanup function
    return () => {
      // Only attempt to remove the map if it exists and has not been destroyed
      if (map.current) {
        try {
          // This prevents the error by checking if the map is still valid
          if (!map.current._removed) {
            map.current.remove();
          }
        } catch (e) {
          console.error("Error during map cleanup:", e);
        } finally {
          map.current = null;
        }
      }
    };
  }, [config]);

  return { mapContainer, map, mapError };
};
