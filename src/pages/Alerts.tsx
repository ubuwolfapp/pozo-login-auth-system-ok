
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PressureChart from '@/components/PressureChart';
import AlertList from '@/components/alerts/AlertList';
import AlertFilters from '@/components/alerts/AlertFilters';
import AlertsNavigation from '@/components/alerts/AlertsNavigation';

type FilterType = 'todas' | 'criticas' | 'resueltas';

const Alerts = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts', activeFilter],
    queryFn: async () => {
      let query = supabase
        .from('alertas')
        .select(`
          *,
          pozo:pozos(nombre)
        `);
      
      if (activeFilter === 'criticas') {
        query = query.eq('tipo', 'critica');
      } else if (activeFilter === 'resueltas') {
        query = query.eq('resuelto', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: pressureData, isLoading: pressureLoading } = useQuery({
    queryKey: ['pressure-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('presion_historial')
        .select('*')
        .order('fecha', { ascending: true })
        .limit(24);

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-[#1C2526] text-white font-sans">
      <AlertsNavigation />
      
      <AlertFilters 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      
      <div className="mx-4 mb-4 bg-[#1C2526] rounded-lg p-4 border border-gray-700">
        <PressureChart data={pressureData || []} />
      </div>
      
      <div className="px-4 pb-24">
        <AlertList alerts={alerts} isLoading={alertsLoading} />
      </div>
    </div>
  );
};

export default Alerts;
