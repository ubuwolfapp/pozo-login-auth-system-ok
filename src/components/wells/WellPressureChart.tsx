
import React from 'react';
import { Card } from '@/components/ui/card';
import PressureChart from '@/components/PressureChart';

const WellPressureChart = () => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Presión</h3>
          <span className="text-sm text-gray-400">Últimas 24 horas</span>
        </div>
        <div className="h-[200px]">
          <PressureChart data={[]} />
        </div>
      </div>
    </Card>
  );
};

export default WellPressureChart;
