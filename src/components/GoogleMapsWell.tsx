import React, { useRef, useState, useEffect } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import ApiKeyDialog from './maps/ApiKeyDialog';
import MapError from './maps/MapError';
import MapLoading from './maps/MapLoading';
import MapEmptyState from './maps/MapEmptyState';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('google_maps_api_key') || '');
  const [showKeyDialog, setShowKeyDialog] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>('');
  
  const { isLoaded, error } = useGoogleMaps(apiKey);
  
  // Initialize map when script is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    
    try {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: 19.4326, lng: -99.1332 },
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212835" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
          },
        ],
      };
      
      const newMap = new google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  }, [isLoaded]);
  
  // Add markers when wells data or map changes
  useEffect(() => {
    if (!map || !wells.length) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));
    
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();
    
    wells.forEach((well) => {
      try {
        const iconColor = well.estado === 'activo' ? '#10B981' : 
                         well.estado === 'advertencia' ? '#F59E0B' : '#EF4444';
        
        // Create custom SVG icon
        const svgMarker = {
          path: "M12,2C8.14,2,5,5.14,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.14,15.86,2,12,2z M12,4c1.1,0,2,0.9,2,2c0,1.11-0.9,2-2,2s-2-0.9-2-2C10,4.9,10.9,4,12,4z M12,14c-1.67,0-3.14-0.85-4-2.15c0.02-1.32,2.67-2.05,4-2.05s3.98,0.73,4,2.05C15.14,13.15,13.67,14,12,14z",
          fillColor: iconColor,
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "#ffffff",
          scale: 1.5,
          anchor: new google.maps.Point(12, 22),
        };

        const position = { lat: well.latitud, lng: well.longitud };
        
        const marker = new google.maps.Marker({
          position,
          map,
          title: well.nombre,
          icon: svgMarker,
        });
        
        const contentString = `
          <div style="color: white; padding: 10px; background: #2E3A59; border-radius: 8px; min-width: 200px;">
            <h3 style="margin-top: 0; font-weight: bold;">${well.nombre}</h3>
            <p><strong>Estado:</strong> ${well.estado}</p>
            <p><strong>Producción diaria:</strong> ${well.produccion_diaria} bbls</p>
            <p><strong>Coordenadas:</strong> ${well.latitud.toFixed(4)}, ${well.longitud.toFixed(4)}</p>
          </div>
        `;
        
        const infoWindow = new google.maps.InfoWindow({
          content: contentString,
        });
        
        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
        
        newMarkers.push(marker);
        bounds.extend(position);
      } catch (error) {
        console.error('Error creating marker:', error);
      }
    });
    
    setMarkers(newMarkers);
    
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      if (newMarkers.length === 1) {
        map.setZoom(12);
      }
    }
  }, [wells, map]);
  
  const handleSaveApiKey = () => {
    if (tempApiKey) {
      localStorage.setItem('google_maps_api_key', tempApiKey);
      setApiKey(tempApiKey);
      setShowKeyDialog(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="absolute inset-0 rounded-lg overflow-hidden"></div>
      
      {!isLoaded && !error && <MapLoading />}
      
      {error && (
        <MapError 
          error={error} 
          onConfigureApiKey={() => setShowKeyDialog(true)} 
        />
      )}
      
      {!error && wells.length === 0 && <MapEmptyState />}
      
      <ApiKeyDialog
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
        tempApiKey={tempApiKey}
        onApiKeyChange={setTempApiKey}
        onSave={handleSaveApiKey}
      />
    </div>
  );
};

export default GoogleMapsWell;
