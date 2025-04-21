
// Fix WellStats component to display presion and flujo properly (not 0)
import React from 'react';
import { Card } from '@/components/ui/card';
import { Well } from '@/services/wellService';

interface WellStatsProps {
  well: Well;
}

const WellStats = ({ well }: WellStatsProps) => {
  // Fix: use the actual values or fallback to undefined, avoid showing zero if missing
  const pressure = well.presion ?? undefined;
  const flow = well.flujo ?? undefined;
  const temperature = well.temperatura ?? undefined;
  const level = well.nivel_porcentaje ?? undefined;
  const production = well.produccion_diaria ?? undefined;

  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-orange-500 font-medium">
            Presión: {pressure !== undefined ? pressure.toLocaleString() : 'N/A'} psi
          </div>
          <div className="text-white">
            Flujo: {flow !== undefined ? flow.toLocaleString() : 'N/A'} barriles/día
          </div>
        </div>
        <div>
          <div className="text-white">
            Temperatura: {temperature !== undefined ? temperature.toLocaleString() : 'N/A'}°C
          </div>
          <div className="text-white">
            Nivel: {level !== undefined ? level.toLocaleString() : 'N/A'}%
          </div>
        </div>
        <div className="col-span-2 pt-2">
          <div className="text-orange-500 font-medium">
            Producción: {production !== undefined ? production.toLocaleString() : 'N/A'} barriles/día
          </div>
          <div className="text-white text-sm mt-1">
            Última actualización: {new Date(well.ultima_actualizacion || new Date()).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WellStats;
