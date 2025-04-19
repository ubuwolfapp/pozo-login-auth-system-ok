
import { useEffect } from 'react';
import { Well } from '@/services/wellService';
import mapboxgl from 'mapbox-gl';
import { getStatusColor, getStatusTextColor } from '@/utils/wellStatusColors';

export const useWellMarkers = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  wells: Well[],
  onSelectWell: (well: Well) => void
) => {
  useEffect(() => {
    if (!map.current || !wells || wells.length === 0) return;
    
    const markersRef: mapboxgl.Marker[] = [];

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

        const statusColor = getStatusColor(well.estado);
        
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
          
        el.addEventListener('click', () => onSelectWell(well));
        markersRef.push(marker);
      } catch (e) {
        console.error("Error al crear marcador:", e);
      }
    });

    return () => {
      markersRef.forEach(marker => marker.remove());
    };
  }, [wells, map.current, onSelectWell]);
};
