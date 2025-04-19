
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface MapErrorProps {
  error: string;
  onRetry: () => void;
}

const MapError = ({ error, onRetry }: MapErrorProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="text-center text-white p-4 max-w-md mx-auto">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-lg font-medium mb-2">Error en el mapa</p>
        <p className="text-sm mb-4">{error}</p>
        <Button 
          variant="outline" 
          className="w-full bg-pozo-orange hover:bg-orange-600 text-white"
          onClick={onRetry}
        >
          Reintentar
        </Button>
      </div>
    </div>
  );
};

export default MapError;
