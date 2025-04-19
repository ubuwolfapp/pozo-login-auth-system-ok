
import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PressureChart from '@/components/PressureChart';

interface WellPressureChartProps {
  wellId: string;
}

const WellPressureChart = ({ wellId }: WellPressureChartProps) => {
  const { data: pressureData } = useQuery({
    queryKey: ['wellPressureHistory', wellId],
    queryFn: async () => {
      const { data } = await supabase
        .from('presion_historial')
        .select('*')
        .eq('pozo_id', wellId)
        .order('fecha', { ascending: true });
      
      return data?.map(item => ({
        fecha: item.fecha,
        valor: item.valor
      })) || [];
    }
  });

  return (
    <Card className="bg-slate-800 border-slate-700">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Presión</h3>
          <span className="text-sm text-gray-400">Últimas 24 horas</span>
        </div>
        <div className="h-[200px]">
          <PressureChart data={pressureData || []} />
        </div>
      </div>
    </Card>
  );
};

export default WellPressureChart;
