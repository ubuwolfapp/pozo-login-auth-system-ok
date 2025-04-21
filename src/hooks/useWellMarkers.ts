
import { useEffect } from 'react';
import { Well } from '@/services/wellService';
import L from 'leaflet';
import { getStatusColor } from '@/utils/wellStatusColors';

export const useWellMarkers = (
  map: React.MutableRefObject<L.Map | null>,
  wells: Well[],
  onSelectWell: (well: Well) => void
) => {
  useEffect(() => {
    if (!map.current || !wells || wells.length === 0) return;
    
    const markersLayer = L.layerGroup().addTo(map.current);

    wells.forEach(well => {
      try {
        // Create a custom icon for the well
        const wellIcon = L.divIcon({
          className: 'well-marker',
          html: `
            <div class="relative">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#F97316">
                <path d="M12 2L8 6h3v6l-2 3v7h6v-7l-2-3V6h3L12 2z" />
                <path d="M5 10h2v2H5zM17 10h2v2h-2zM5 14h2v2H5zM17 14h2v2h-2z" />
              </svg>
              <div class="text-white font-bold text-xs text-center whitespace-nowrap text-shadow">${well.nombre}</div>
              ${well.estado !== 'activo' ? `
                <div class="absolute top-0 right-0 w-3 h-3 rounded-full bg-${
                  well.estado === 'advertencia' ? 'yellow' : 'red'
                }-500 border-2 border-slate-800"></div>
              ` : ''}
            </div>
          `,
          iconSize: [32, 42],
          iconAnchor: [16, 42]
        });

        // Create marker and add to map
        const marker = L.marker([well.latitud, well.longitud], { 
          icon: wellIcon 
        }).addTo(markersLayer);

        // Add click event
        marker.on('click', () => onSelectWell(well));
        
        // Add popup
        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">${well.nombre}</h3>
            <p>Estado: ${well.estado}</p>
            <p>Producción: ${well.produccion_diaria} barriles/día</p>
          </div>
        `);
      } catch (e) {
        console.error("Error al crear marcador:", e);
      }
    });

    // Center map on markers if available
    if (wells.length > 0) {
      const bounds = L.latLngBounds(wells.map(well => [well.latitud, well.longitud]));
      map.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Clean up function
    return () => {
      if (map.current) {
        // Fix the Leaflet error by checking if the map has been removed
        if (!map.current.getContainer()._leaflet_id) {
          markersLayer.remove();
        }
      }
    };
  }, [wells, map.current, onSelectWell]);
};
