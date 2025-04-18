
import React from 'react';

const MapEmptyState: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="text-center text-white p-4 max-w-md mx-auto">
        <p className="mb-4">No hay pozos para mostrar en el mapa</p>
      </div>
    </div>
  );
};

export default MapEmptyState;
