
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export const useOpenStreetMap = (config: {
  centro_latitud: number;
  centro_longitud: number;
  zoom_inicial: number;
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Clean up previous map instance if it exists
      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      // Initialize the map
      map.current = L.map(mapContainer.current).setView(
        [config.centro_latitud, config.centro_longitud], 
        config.zoom_inicial
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map.current);

      // Add zoom control
      L.control.zoom({ position: 'topright' }).addTo(map.current);

      setMapError(null);
    } catch (e) {
      console.error("Error al inicializar el mapa:", e);
      setMapError("No se pudo inicializar el mapa. Verifica la configuración.");
    }

    // Clean up function
    return () => {
      if (map.current) {
        try {
          map.current.remove();
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
