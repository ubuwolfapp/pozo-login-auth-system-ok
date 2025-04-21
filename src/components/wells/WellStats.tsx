
import React from 'react';
import { Card } from '@/components/ui/card';
import { Well } from '@/services/wellService';

interface WellStatsProps {
  well: Well;
}

const WellStats = ({ well }: WellStatsProps) => {
  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-orange-500 font-medium">
            Presión: {well.presion || 0} psi
          </div>
          <div className="text-white">
            Flujo: {well.flujo || 0} barriles/día
          </div>
        </div>
        <div>
          <div className="text-white">
            Temperatura: {well.temperatura || 0}°C
          </div>
          <div className="text-white">
            Nivel: {well.nivel_porcentaje || 0}%
          </div>
        </div>
        <div className="col-span-2 pt-2">
          <div className="text-orange-500 font-medium">
            Producción: {well.produccion_diaria || 0} barriles/día
          </div>
          <div className="text-white text-sm mt-1">
            Última actualización: {new Date(well.ultima_actualizacion).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WellStats;
