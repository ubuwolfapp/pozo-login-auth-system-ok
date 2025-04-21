import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PressureChart from '@/components/PressureChart';
import AlertList from '@/components/alerts/AlertList';
import AlertFilters from '@/components/alerts/AlertFilters';
import AlertsNavigation from '@/components/alerts/AlertsNavigation';
import { Alert, AlertType } from '@/types/alerts';
import { supabase } from '@/integrations/supabase/client';
import { wellService } from '@/services/wellService';
import { useToast } from '@/hooks/use-toast';

const Alerts = () => {
  const [activeFilter, setActiveFilter] = useState<AlertType>('todas');
  const [selectedWellId, setSelectedWellId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wells } = useQuery({
    queryKey: ['wells'],
    queryFn: wellService.getWells
  });

  const fetchAlerts = async () => {
    console.log('Fetching alerts from database');
    
    // Obtener los IDs de los pozos del usuario
    const userWells = await wellService.getWells();
    const wellIds = userWells.map(well => well.id);
    
    if (wellIds.length === 0) {
      console.log('No wells found for user, returning empty alerts');
      return [];
    }
    
    console.log(`Filtrando alertas para ${wellIds.length} pozos: ${wellIds.join(', ')}`);
    
    // Consultar solo las alertas de los pozos del usuario
    let query = supabase
      .from('alertas')
      .select('*, pozo:pozo_id (id, nombre)')
      .in('pozo_id', wellIds)
      .order('created_at', { ascending: false });
    
    // Aplicar filtros adicionales según el filtro activo
    if (selectedWellId) {
      console.log(`Aplicando filtro adicional por pozo ID: ${selectedWellId}`);
      query = query.eq('pozo_id', selectedWellId);
    }
    
    const { data: dbAlerts, error } = await query;
    
    if (error) {
      console.error('Error fetching alerts from database:', error);
      throw error;
    }
    
    console.log('Database alerts fetched:', dbAlerts?.length || 0);
    
    return dbAlerts?.map(alert => ({
      ...alert,
      pozo: {
        id: alert.pozo?.id || '',
        nombre: alert.pozo?.nombre || ''
      }
    })) as Alert[] || [];
  };

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', activeFilter, selectedWellId],
    queryFn: async () => {
      const allAlerts = await fetchAlerts();
      
      let filteredAlerts = allAlerts;
      
      if (selectedWellId) {
        console.log('Filtering alerts by well ID:', selectedWellId);
        filteredAlerts = filteredAlerts.filter(alert => alert.pozo?.id === selectedWellId);
      }

      // Aplicar filtro por tipo de alerta
      if (activeFilter === 'critica') {
        console.log('Filtrando alertas críticas');
        return filteredAlerts.filter(alert => alert.tipo === 'critica');
      } else if (activeFilter === 'advertencia') {
        console.log('Filtrando alertas de advertencia');
        return filteredAlerts.filter(alert => alert.tipo === 'advertencia');
      } else if (activeFilter === 'resueltas') {
        console.log('Filtrando alertas resueltas');
        return filteredAlerts.filter(alert => alert.resuelto);
      }
      
      console.log('Retornando todas las alertas filtradas:', filteredAlerts.length);
      return filteredAlerts;
    },
    refetchInterval: 30000,
    enabled: !!wells,
  });

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
      const fecha_resolucion = new Date().toISOString();
      const updateData = { 
        resuelto: true,
        resolucion: resolutionText,
        fecha_resolucion
      };
      
      console.log('Updating alert in database:', alertId, 'with data:', updateData);
      
      const { error } = await supabase
        .from('alertas')
        .update(updateData)
        .eq('id', alertId);
          
      if (error) {
        console.error('Error updating alert in database:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar la resolución de la alerta",
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "Alerta resuelta",
        description: "La alerta ha sido marcada como resuelta",
      });
      
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al resolver la alerta",
        variant: "destructive"
      });
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
