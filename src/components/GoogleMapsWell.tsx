
import React, { useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import 'leaflet/dist/leaflet.css';
import MapLoading from './maps/MapLoading';
import MapEmptyState from './maps/MapEmptyState';
import MapError from './maps/MapError';

interface Well {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  estado: string;
  produccion_diaria: number;
}

interface GoogleMapsWellProps {
  wells: Well[];
}

const GoogleMapsWell: React.FC<GoogleMapsWellProps> = ({ wells }) => {
  const { isLoaded, error } = useGoogleMaps();
  const [mapError, setMapError] = useState<string | null>(null);

  // For debug - verify we have data
  console.log("Wells available for display:", wells);

  if (!isLoaded) {
    return <MapLoading />;
  }

  if (mapError) {
    return <MapError error={mapError} onRetry={() => setMapError(null)} />;
  }

  return (
    <div className="relative w-full h-full">
      {wells.length === 0 ? (
        <MapEmptyState />
      ) : (
        <div className="w-full h-full rounded-lg bg-[#2A3441] p-4 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-white mb-4">Mapa temporalmente en mantenimiento</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {wells.map((well) => (
                <div 
                  key={well.id}
                  className="bg-[#1E2835] p-4 rounded-md"
                >
                  <h3 className="font-bold text-white mb-2">{well.nombre}</h3>
                  <div className="flex items-center mb-1">
                    <span className={`w-3 h-3 rounded-full mr-2 ${
                      well.estado === 'activo' ? 'bg-green-500' : 
                      well.estado === 'advertencia' ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}></span>
                    <p className="text-gray-300 text-sm">Estado: {well.estado}</p>
                  </div>
                  <p className="text-gray-300 text-sm">Producción: {well.produccion_diaria} bbls</p>
                  <p className="text-gray-300 text-sm">
                    Ubicación: {well.latitud.toFixed(4)}, {well.longitud.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsWell;
