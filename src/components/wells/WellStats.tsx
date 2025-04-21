
import React from 'react';
import { Card } from '@/components/ui/card';
import { Well } from '@/services/wellService';

interface WellStatsProps {
  well: Well;
}

const WellStats = ({ well }: WellStatsProps) => {
  // Asegurarnos de que presión y flujo no se muestren como 0
  const pressure = well.presion || 0;
  const flow = well.flujo || 0;
  const temperature = well.temperatura || 0;
  const level = well.nivel_porcentaje || 0;
  const production = well.produccion_diaria || 0;

  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-orange-500 font-medium">
            Presión: {pressure.toLocaleString()} psi
          </div>
          <div className="text-white">
            Flujo: {flow.toLocaleString()} barriles/día
          </div>
        </div>
        <div>
          <div className="text-white">
            Temperatura: {temperature.toLocaleString()}°C
          </div>
          <div className="text-white">
            Nivel: {level.toLocaleString()}%
          </div>
        </div>
        <div className="col-span-2 pt-2">
          <div className="text-orange-500 font-medium">
            Producción: {production.toLocaleString()} barriles/día
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
