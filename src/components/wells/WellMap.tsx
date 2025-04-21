
import React from 'react';
import { Well } from '@/services/wellService';
import { useOpenStreetMap } from '@/hooks/useOpenStreetMap';
import { useWellMarkers } from '@/hooks/useWellMarkers';
import MapLoading from '@/components/maps/MapLoading';
import MapError from '@/components/maps/MapError';
import MapEmptyState from '@/components/maps/MapEmptyState';
import 'leaflet/dist/leaflet.css';

interface WellMapProps {
  wells: Well[];
  onSelectWell: (well: Well) => void;
}

const WellMap: React.FC<WellMapProps> = ({ wells, onSelectWell }) => {
  // Initialize the text shadow style once
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .text-shadow {
        text-shadow: 0px 0px 3px #000, 0px 0px 3px #000;
      }
      .leaflet-popup-content-wrapper {
        background: #222;
        color: #fff;
        border-radius: 8px;
      }
      .leaflet-popup-tip {
        background: #222;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const { mapContainer, map, mapError } = useOpenStreetMap({
    centro_latitud: 19.4326,
    centro_longitud: -99.1332,
    zoom_inicial: 5
  });

  // Use the well markers hook
  useWellMarkers(map, wells, onSelectWell);

  return (
    <div className="relative w-full h-[50vh] rounded-lg overflow-hidden bg-slate-800">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {!map.current && <MapLoading />}
      
      {mapError && (
        <MapError 
          error={mapError} 
          onRetry={() => window.location.reload()} 
        />
      )}

      {!mapError && wells && wells.length === 0 && <MapEmptyState />}
    </div>
  );
};

export default WellMap;
