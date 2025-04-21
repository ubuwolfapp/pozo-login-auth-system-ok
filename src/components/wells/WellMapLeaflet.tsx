
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Well } from '@/services/wellService';

// Corrige el icono por defecto de leaflet (sino no aparece nada)
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
}

const DEFAULT_POSITION = [19.4326, -99.1332]; // CDMX

const estadoColor = (estado: string) => {
  if (estado === 'activo') return 'bg-green-500';
  if (estado === 'advertencia') return 'bg-yellow-500';
  return 'bg-red-600';
};

const WellMapLeaflet: React.FC<WellMapLeafletProps> = ({ wells, onSelectWell }) => {
  return (
    <div className="relative w-full h-[50vh] rounded-lg overflow-hidden bg-slate-800">
      <MapContainer
        center={DEFAULT_POSITION as [number, number]}
        zoom={6}
        className="w-full h-full min-h-[50vh]"
        scrollWheelZoom={true}
        style={{
          width: '100%',
          height: '50vh',
        }}
      >
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
    </div>
  );
};

export default WellMapLeaflet;
