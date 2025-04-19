
import React, { useState } from 'react';
import { Well } from '@/services/wellService';
import { useMapbox } from '@/hooks/useMapbox';
import { useWellMarkers } from '@/hooks/useWellMarkers';
import MapTokenDialog from '@/components/maps/MapTokenDialog';
import MapLoading from '@/components/maps/MapLoading';
import MapError from '@/components/maps/MapError';
import MapEmptyState from '@/components/maps/MapEmptyState';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface WellMapProps {
  wells: Well[];
  onSelectWell: (well: Well) => void;
}

let MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

const WellMap: React.FC<WellMapProps> = ({ wells, onSelectWell }) => {
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [storedToken, setStoredToken] = useState(() => {
    return localStorage.getItem('mapbox_token') || '';
  });

  // Use stored token if it exists
  if (storedToken) {
    MAPBOX_TOKEN = storedToken;
  }

  // Set Mapbox token
  mapboxgl.accessToken = MAPBOX_TOKEN;

  // Initialize the text shadow style once
  React.useEffect(() => {
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

  const { mapContainer, map, mapError } = useMapbox({
    centro_latitud: 19.4326,
    centro_longitud: -99.1332,
    zoom_inicial: 5
  });

  // Use the well markers hook
  useWellMarkers(map, wells, onSelectWell);

  const handleSaveToken = () => {
    if (tempToken) {
      localStorage.setItem('mapbox_token', tempToken);
      setStoredToken(tempToken);
      setShowTokenDialog(false);
      
      // Force reload of the page to reinitialize map with new token
      window.location.reload();
    }
  };

  return (
    <div className="relative w-full h-[50vh] rounded-lg overflow-hidden bg-slate-800">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {!map.current && <MapLoading />}
      
      {mapError && (
        <MapError 
          error={mapError} 
          onRetry={() => setShowTokenDialog(true)} 
        />
      )}

      {!mapError && wells && wells.length === 0 && <MapEmptyState />}

      <MapTokenDialog 
        open={showTokenDialog}
        onOpenChange={setShowTokenDialog}
        tempToken={tempToken}
        onTokenChange={setTempToken}
        onSave={handleSaveToken}
      />
    </div>
  );
};

export default WellMap;
