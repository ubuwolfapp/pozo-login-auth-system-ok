
import React from 'react';
import { Well } from '@/services/wellService';
import { useMapbox } from '@/hooks/useMapbox';
import { useWellMarkers } from '@/hooks/useWellMarkers';
import MapTokenDialog from '@/components/maps/MapTokenDialog';
import MapLoading from '@/components/maps/MapLoading';
import MapError from '@/components/maps/MapError';
import MapEmptyState from '@/components/maps/MapEmptyState';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface WellMapViewProps {
  wells: Well[];
  onSelectWell: (well: Well) => void;
}

export const WellMapView: React.FC<WellMapViewProps> = ({ wells, onSelectWell }) => {
  const {
    showTokenDialog,
    setShowTokenDialog,
    tempToken,
    setTempToken,
    handleSaveToken,
    mapboxToken
  } = useMapboxToken();

  // Set Mapbox token
  mapboxgl.accessToken = mapboxToken;

  const { mapContainer, map, mapError } = useMapbox({
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
