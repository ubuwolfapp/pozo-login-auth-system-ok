
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

// Define the Well interface
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
  const [mapError, setMapError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>('');
  
  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!apiKey) {
        setShowKeyDialog(true);
        return;
      }

      // Check if script is already loaded
      if (window.google && window.google.maps) {
        setScriptLoaded(true);
        return;
      }

      try {
        // Remove any existing Google Maps scripts to prevent conflicts
        const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
        existingScripts.forEach(script => script.remove());
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=googleMapsInitialized`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          setMapError('Error al cargar el script de Google Maps. Verifique su API key.');
          setShowKeyDialog(true);
        };
        
        // Define the callback function
        window.googleMapsInitialized = () => {
          setScriptLoaded(true);
          setMapError(null);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps script:', error);
        setMapError('Error al cargar el script de Google Maps');
        setShowKeyDialog(true);
      }
    };
    
    loadGoogleMapsScript();
    
    return () => {
      // Clean up the global callback when component unmounts
      if (window.googleMapsInitialized) {
        delete window.googleMapsInitialized;
      }
    };
  }, [apiKey]);
  
  // Initialize map when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current) return;
    
    try {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: 19.4326, lng: -99.1332 }, // Default center (Mexico City)
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
            stylers: [{ color: "#212a37" }],
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
      setMapError('Error al inicializar el mapa de Google');
    }
  }, [scriptLoaded]);
  
  // Add markers when wells data or map changes
  useEffect(() => {
    if (!map || !wells.length) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));
    
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();
    
    wells.forEach((well) => {
      try {
        // Determine icon color based on well state
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
        
        // Add marker to map
        const marker = new google.maps.Marker({
          position,
          map,
          title: well.nombre,
          icon: svgMarker,
        });
        
        // Create info window content
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
    
    // Adjust map to fit all markers
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);
      
      // If we only have one marker, zoom out a bit
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
  
  // Add CSS for Google Maps info windows
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .gm-style-iw {
        background-color: #2E3A59 !important;
        border-radius: 8px !important;
        padding: 0 !important;
      }
      .gm-style-iw-d {
        overflow: hidden !important;
      }
      .gm-style-iw-t::after {
        background: #2E3A59 !important;
      }
      .gm-ui-hover-effect {
        background-color: rgba(255,255,255,0.4) !important;
        border-radius: 50% !important;
        margin-top: 6px !important;
        margin-right: 6px !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Declare the global googleMapsInitialized function
  declare global {
    interface Window {
      googleMapsInitialized: () => void;
    }
  }
  
  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="absolute inset-0 rounded-lg overflow-hidden"></div>
      
      {!scriptLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Cargando mapa...</p>
          </div>
        </div>
      )}
      
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center text-white p-4 max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-lg font-medium mb-2">Error en el mapa</p>
            <p className="text-sm mb-4">{mapError}</p>
            <Button 
              variant="outline" 
              className="w-full bg-pozo-orange hover:bg-orange-600 text-white"
              onClick={() => setShowKeyDialog(true)}
            >
              Configurar API Key de Google Maps
            </Button>
          </div>
        </div>
      )}
      
      {!mapError && wells.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white p-4 max-w-md mx-auto">
            <p className="mb-4">No hay pozos para mostrar en el mapa</p>
          </div>
        </div>
      )}
      
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Google Maps API Key</DialogTitle>
            <DialogDescription>
              Introduce tu API Key de Google Maps para visualizar los mapas correctamente.
              Puedes obtener una en <a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank" rel="noopener noreferrer" className="text-pozo-orange hover:underline">Google Cloud Platform</a>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Introduce tu API Key de Google Maps..."
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
            />
            <div className="flex justify-end">
              <Button 
                className="bg-pozo-orange hover:bg-orange-600 text-white"
                onClick={handleSaveApiKey}
                disabled={!tempApiKey}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoogleMapsWell;
