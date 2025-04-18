
import React, { useEffect, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapLoading from './maps/MapLoading';
import MapEmptyState from './maps/MapEmptyState';
import MapError from './maps/MapError';

// Fix para los iconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

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

// Componente para actualizar la vista del mapa cuando cambian las coordenadas
function SetViewOnChange({ coords }: { coords: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(coords, 10);
  }, [coords, map]);
  
  return null;
}

const GoogleMapsWell: React.FC<GoogleMapsWellProps> = ({ wells }) => {
  const { isLoaded, error } = useGoogleMaps();
  const [mapError, setMapError] = useState<string | null>(null);

  // Crear iconos personalizados según el estado del pozo
  const getWellIcon = (estado: string) => {
    const iconColor = 
      estado === 'activo' ? '#10B981' : 
      estado === 'advertencia' ? '#F59E0B' : '#EF4444';
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="background-color: ${iconColor}; width: 12px; height: 12px; 
        border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  // Determinar la posición del centro del mapa
  const getMapCenter = (): [number, number] => {
    if (wells.length === 0) {
      return [19.4326, -99.1332]; // Default a Ciudad de México si no hay pozos
    }
    
    // Calcular el promedio de todas las coordenadas
    const avgLat = wells.reduce((sum, well) => sum + well.latitud, 0) / wells.length;
    const avgLng = wells.reduce((sum, well) => sum + well.longitud, 0) / wells.length;
    
    return [avgLat, avgLng];
  };

  useEffect(() => {
    console.log("Pozos disponibles para mostrar:", wells);
  }, [wells]);

  if (!isLoaded) {
    return <MapLoading />;
  }

  if (mapError) {
    return <MapError error={mapError} onRetry={() => setMapError(null)} />;
  }

  // Para debug - verifica que tengamos datos
  console.log("Renderizando mapa con pozos:", wells);
  
  const center = getMapCenter();

  return (
    <div className="relative w-full h-full">
      {wells.length === 0 ? (
        <MapEmptyState />
      ) : (
        <MapContainer 
          center={center} 
          zoom={10} 
          style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
        >
          <SetViewOnChange coords={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {wells.map((well) => (
            <Marker 
              key={well.id} 
              position={[well.latitud, well.longitud]}
              icon={getWellIcon(well.estado)}
            >
              <Popup>
                <div className="bg-[#2E3A59] text-white p-2 rounded-md">
                  <h3 className="font-bold">{well.nombre}</h3>
                  <p><strong>Estado:</strong> {well.estado}</p>
                  <p><strong>Producción diaria:</strong> {well.produccion_diaria} bbls</p>
                  <p><strong>Coordenadas:</strong> {well.latitud.toFixed(4)}, {well.longitud.toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default GoogleMapsWell;
