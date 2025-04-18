
import React, { useEffect, useRef } from 'react';
import { Well } from '@/services/wellService';
import { Factory } from 'lucide-react';

interface WellMapProps {
  wells: Well[];
  onSelectWell: (well: Well) => void;
}

const WellMap: React.FC<WellMapProps> = ({ wells, onSelectWell }) => {
  // Configuración para posicionar los pozos en un área más visible
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Calcular dimensiones del contenedor
  useEffect(() => {
    const updateWellPositions = () => {
      if (!mapContainerRef.current) return;
    };
    
    updateWellPositions();
    window.addEventListener('resize', updateWellPositions);
    
    return () => {
      window.removeEventListener('resize', updateWellPositions);
    };
  }, [wells]);

  return (
    <div 
      ref={mapContainerRef}
      className="h-[50vh] bg-slate-900 rounded-lg p-4 relative overflow-hidden border border-slate-700"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-slate-500 mb-8">
          Mapa de visualización
        </div>
      </div>
      
      <div className="relative w-full h-full">
        {wells.map((well) => {
          // Calcular posiciones relativas basadas en un grid imaginario
          const gridX = (parseInt(well.id, 36) % 5) / 5;  // Distribuir horizontalmente
          const gridY = (parseInt(well.id.slice(-2), 36) % 8) / 8;  // Distribuir verticalmente
          
          return (
            <div
              key={well.id}
              className="absolute cursor-pointer transform transition-transform hover:scale-110"
              style={{
                left: `${5 + gridX * 90}%`,
                top: `${10 + gridY * 80}%`
              }}
              onClick={() => onSelectWell(well)}
            >
              <div className="relative group">
                <Factory
                  className={`h-8 w-8 ${
                    well.estado === 'advertencia' ? 'text-yellow-500' : 
                    well.estado === 'fuera_de_servicio' ? 'text-red-500' : 'text-green-500'
                  }`}
                />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {well.nombre}
                  <div className="text-[10px] text-slate-400">
                    {well.produccion_diaria.toFixed(0)} bbls
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="absolute bottom-2 right-2 text-xs text-slate-500">
        * Visualización simplificada del mapa
      </div>
    </div>
  );
};

export default WellMap;
