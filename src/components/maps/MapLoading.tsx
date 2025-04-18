
import React from 'react';

const MapLoading: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
        <p>Cargando mapa...</p>
      </div>
    </div>
  );
};

export default MapLoading;
