
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
          <div className="text-orange-500">
            Presión: {well.presion} psi
          </div>
          <div className="text-white">
            Flujo: {well.flujo} barriles/día
          </div>
        </div>
        <div>
          <div className="text-white">
            Temperatura: {well.temperatura}°C
          </div>
          <div className="text-white">
            Nivel: {well.nivel_porcentaje}%
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WellStats;
