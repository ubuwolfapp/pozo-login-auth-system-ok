import React from 'react';
import { Well } from '@/services/wellService';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
interface WellListProps {
  wells: Well[];
  onSelectWell: (well: Well) => void;
}
const WellList: React.FC<WellListProps> = ({
  wells,
  onSelectWell
}) => {
  return <div className="space-y-4 p-4">
      {wells.map(well => <div key={well.id} onClick={() => onSelectWell(well)} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <h3 className="font-medium">{well.nombre}</h3>
              <p className="text-sm text-gray-400">{well.produccion_diaria} barriles/día</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {well.estado === 'advertencia' && <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />}
            <img alt="Pozo ejemplo" src="/lovable-uploads/b95d5f26-748c-4aa2-afa7-debb2c4a40d2.jpg" className="w-12 h-12 rounded-md border border-gray-600 object-cover" />
          </div>
        </div>)}
    </div>;
};
export default WellList;