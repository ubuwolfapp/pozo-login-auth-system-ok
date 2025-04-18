
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PressureChart from '@/components/PressureChart';
import AlertList from '@/components/alerts/AlertList';
import AlertFilters from '@/components/alerts/AlertFilters';
import AlertsNavigation from '@/components/alerts/AlertsNavigation';
import { Alert, AlertType } from '@/types/alerts';
import { supabase } from '@/integrations/supabase/client';
import { wellService } from '@/services/wellService';

const Alerts = () => {
  const [activeFilter, setActiveFilter] = useState<AlertType>('todas');
  const [selectedWellId, setSelectedWellId] = useState<string | null>(null);
  const [resolvedAlerts, setResolvedAlerts] = useState<string[]>([]);

  // First fetch all wells to ensure we have valid well data
  const { data: wells } = useQuery({
    queryKey: ['wells'],
    queryFn: wellService.getWells
  });

  // Fetch real database alerts
  const fetchAlerts = async () => {
    try {
      console.log('Fetching alerts from database');
      let query = supabase
        .from('alertas')
        .select('*, pozo:pozo_id (id, nombre)')
        .order('created_at', { ascending: false });
      
      const { data: dbAlerts, error } = await query;
      
      if (error) {
        console.error('Error fetching alerts from database:', error);
        throw error;
      }
      
      if (dbAlerts && dbAlerts.length > 0) {
        console.log('Database alerts fetched:', dbAlerts.length);
        
        // Transform the data to match our Alert type
        return dbAlerts.map(alert => {
          return {
            ...alert,
            pozo: {
              id: alert.pozo?.id || '',
              nombre: alert.pozo?.nombre || ''
            },
            // Make sure to handle resuelto properly
            resuelto: alert.resuelto || resolvedAlerts.includes(alert.id)
          };
        }) as Alert[];
      } else {
        console.log('No database alerts found, checking if wells exist to create simulated alerts');
        
        // If no database alerts but we have wells, create simulated alerts using real well data
        if (wells && wells.length > 0) {
          const simulatedAlerts: Alert[] = [
            {
              id: '1',
              tipo: 'critica',
              mensaje: `Presión alta en ${wells[0].nombre}: 8500 psi`,
              created_at: '2025-04-16T14:30:00Z',
              resuelto: resolvedAlerts.includes('1'),
              pozo: { 
                id: wells[0].id, 
                nombre: wells[0].nombre 
              },
              valor: 8500,
              unidad: 'psi'
            },
            {
              id: '2',
              tipo: 'advertencia',
              mensaje: `Temperatura moderada en ${wells.length > 1 ? wells[1].nombre : wells[0].nombre}`,
              created_at: '2025-04-16T03:15:00Z',
              resuelto: resolvedAlerts.includes('2'),
              pozo: { 
                id: wells.length > 1 ? wells[1].id : wells[0].id, 
                nombre: wells.length > 1 ? wells[1].nombre : wells[0].nombre 
              }
            }
          ];
          console.log('Created simulated alerts with real well data:', simulatedAlerts);
          return simulatedAlerts;
        }
        
        console.log('No wells found, returning empty alerts array');
        return [];
      }
    } catch (error) {
      console.error('Error in fetchAlerts:', error);
      return [];
    }
  };

  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['alerts', activeFilter, selectedWellId, resolvedAlerts],
    queryFn: async () => {
      const allAlerts = await fetchAlerts();
      
      // Filter alerts based on activeFilter and selectedWellId
      let filteredAlerts = allAlerts;
      
      if (selectedWellId) {
        console.log('Filtering alerts by well ID:', selectedWellId);
        filteredAlerts = filteredAlerts.filter(alert => alert.pozo?.id === selectedWellId);
      }

      if (activeFilter === 'critica') {
        return filteredAlerts.filter(alert => alert.tipo === 'critica');
      } else if (activeFilter === 'advertencia') {
        return filteredAlerts.filter(alert => alert.tipo === 'advertencia');
      } else if (activeFilter === 'resueltas') {
        return filteredAlerts.filter(alert => alert.resuelto);
      }
      return filteredAlerts;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!wells, // Only run this query when wells are loaded
  });

  // Fetch real pressure history data if available
  const { data: pressureData } = useQuery({
    queryKey: ['pressure-history', selectedWellId],
    queryFn: async () => {
      if (selectedWellId) {
        try {
          const { data, error } = await supabase
            .from('presion_historial')
            .select('fecha, valor')
            .eq('pozo_id', selectedWellId)
            .order('fecha', { ascending: true })
            .limit(24);
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            return data;
          }
        } catch (error) {
          console.error('Error fetching pressure history:', error);
        }
      }
      
      // Fallback to simulated data
      const data = [];
      const now = new Date();
      for (let i = 0; i < 24; i++) {
        const date = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        data.push({
          fecha: date.toISOString(),
          valor: 7.5 + Math.sin(i / 3) + Math.random() * 0.5
        });
      }
      return data;
    }
  });

  const handleAlertResolved = async (alertId: string, resolutionText: string) => {
    console.log('Alert resolved callback:', alertId, 'Resolution:', resolutionText);
    
    try {
      // Real database updates for Supabase alerts
      if (alertId.length > 10) { // This is likely a UUID from the database
        console.log('Updating database alert:', alertId);
        const { error } = await supabase
          .from('alertas')
          .update({ 
            resuelto: true,
            resolucion: resolutionText,
            fecha_resolucion: new Date().toISOString()
          })
          .eq('id', alertId);
          
        if (error) throw error;
      }
      
      // Also track locally for simulated alerts and UI updates
      setResolvedAlerts(prev => {
        if (prev.includes(alertId)) return prev;
        return [...prev, alertId];
      });
      
      // Force refetch to update UI with latest data from database
      refetch();
      
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C2526] text-white font-sans">
      <AlertsNavigation />
      
      <div className="container mx-auto px-0">
        <AlertFilters 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          selectedWellId={selectedWellId}
          onWellChange={setSelectedWellId}
          wells={wells || []}
        />
        
        <div className="mx-4 mb-6 bg-[#1C2526] rounded-lg p-4 border border-gray-700">
          <PressureChart data={pressureData || []} />
        </div>
        
        <div className="px-4 pb-24">
          <AlertList 
            alerts={alerts as Alert[] | undefined} 
            isLoading={isLoading} 
            onAlertResolved={handleAlertResolved}
          />
        </div>
      </div>
    </div>
  );
};

export default Alerts;
