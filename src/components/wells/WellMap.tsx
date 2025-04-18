
import React from 'react';
import { Well } from '@/services/wellService';
import { Oil } from 'lucide-react';  // Changed from OilIcon to Oil

interface WellMapProps {
  wells: Well[];
  onSelectWell: (well: Well) => void;
}

const WellMap: React.FC<WellMapProps> = ({ wells, onSelectWell }) => {
  return (
    <div className="h-[50vh] bg-slate-900 rounded-lg p-4">
      <div className="flex items-center justify-center h-full">
        {wells.map((well) => (
          <div
            key={well.id}
            className="absolute"
            style={{
              left: `${(well.longitud + 100) * 2}px`,
              top: `${(well.latitud - 15) * 10}px`
            }}
            onClick={() => onSelectWell(well)}
          >
            <div className="relative group">
              <Oil
                className={`h-6 w-6 ${
                  well.estado === 'advertencia' ? 'text-red-500' : 'text-green-500'
                }`}
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {well.nombre}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WellMap;
