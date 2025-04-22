
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Well } from '@/services/wellService';

// Arreglar el problema de iconos en Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WellMapLeafletProps {
  wells: Well[];
  onSelectWell: (well: Well) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
}

// Componente para actualizar la vista del mapa cuando cambian las props
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    console.log("Actualizando centro del mapa a:", center, "con zoom:", zoom);
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

const DEFAULT_POSITION: [number, number] = [19.4326, -99.1332]; // Ciudad de México

// Función para determinar el color basado en el estado
const estadoColor = (estado: string) => {
  if (estado === 'activo') return 'bg-green-500';
  if (estado === 'advertencia') return 'bg-yellow-500';
  return 'bg-red-600';
};

const WellMapLeaflet: React.FC<WellMapLeafletProps> = ({
  wells,
  onSelectWell,
  initialCenter = DEFAULT_POSITION,
  initialZoom = 6,
}) => {
  // Referencia para saber si el mapa se ha cargado
  const mapRef = useRef<L.Map | null>(null);
  
  // Asegurarse de que initialCenter sea un array válido de números
  const safeCenter: [number, number] = Array.isArray(initialCenter) && 
    initialCenter.length === 2 && 
    !isNaN(initialCenter[0]) && 
    !isNaN(initialCenter[1])
      ? initialCenter as [number, number]
      : DEFAULT_POSITION;
  
  // Asegurarse de que initialZoom sea un número válido
  const safeZoom = !isNaN(initialZoom as number) ? initialZoom : 6;
  
  // Log para debug
  console.log("WellMapLeaflet props center:", initialCenter, "safe center:", safeCenter);
  console.log("WellMapLeaflet props zoom:", initialZoom, "safe zoom:", safeZoom);

  return (
    <div className="relative w-full h-[50vh] rounded-lg overflow-hidden bg-slate-800">
      {wells.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <p className="text-lg">No hay pozos asignados a este mapa</p>
        </div>
      ) : (
        <MapContainer
          center={safeCenter}
          zoom={safeZoom}
          className="w-full h-full min-h-[50vh]"
          scrollWheelZoom={true}
          style={{
            width: '100%',
            height: '50vh',
          }}
          ref={mapRef}
        >
          <MapUpdater center={safeCenter} zoom={safeZoom} />
          
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {wells.map((well) => (
            <Marker
              key={well.id}
              position={[well.latitud, well.longitud]}
              eventHandlers={{
                click: () => onSelectWell(well),
              }}
            >
              <Popup>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-lg">{well.nombre}</strong>
                    <span className={`ml-2 w-3 h-3 rounded-full inline-block ${estadoColor(well.estado)}`}></span>
                  </div>
                  <div>Producción: {well.produccion_diaria} barriles/día</div>
                  <div>Estado: {well.estado}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default WellMapLeaflet;
