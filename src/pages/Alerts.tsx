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
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data: wells
  } = useQuery({
    queryKey: ['wells'],
    queryFn: wellService.getWells
  });
  const fetchAlerts = async () => {
    console.log('Fetching alerts from database');
    let query = supabase.from('alertas').select('*, pozo:pozo_id (id, nombre)').order('created_at', {
      ascending: false
    });
    const {
      data: dbAlerts,
      error
    } = await query;
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
  const {
    data: alerts,
    isLoading
  } = useQuery({
    queryKey: ['alerts', activeFilter, selectedWellId],
    queryFn: async () => {
      const allAlerts = await fetchAlerts();
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
    refetchInterval: 30000,
    enabled: !!wells
  });
  const {
    data: pressureData
  } = useQuery({
    queryKey: ['pressure-history', selectedWellId],
    queryFn: async () => {
      if (selectedWellId) {
        try {
          const {
            data,
            error
          } = await supabase.from('presion_historial').select('fecha, valor').eq('pozo_id', selectedWellId).order('fecha', {
            ascending: true
          }).limit(24);
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
  const handleAlertResolved = async (alertId: string, resolutionText: string, photoUrl?: string | null, docUrl?: string | null) => {
    console.log('Alert resolved callback:', alertId, 'Resolution:', resolutionText);
    console.log('Photo URL:', photoUrl, 'Document URL:', docUrl);
    try {
      const fecha_resolucion = new Date().toISOString();
      const updateData = {
        resuelto: true,
        resolucion: resolutionText,
        fecha_resolucion,
        foto_url: photoUrl || null,
        doc_url: docUrl || null
      };
      console.log('Updating alert in database:', alertId, 'with data:', updateData);
      const {
        error
      } = await supabase.from('alertas').update(updateData).eq('id', alertId);
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
        description: "La alerta ha sido marcada como resuelta"
      });
      await queryClient.invalidateQueries({
        queryKey: ['alerts']
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al resolver la alerta",
        variant: "destructive"
      });
    }
  };
  const handleResolveAllAlerts = async () => {
    if (!alerts || !alerts.length) return;
    try {
      const unresolvedAlerts = alerts.filter(a => !a.resuelto);
      if (!unresolvedAlerts.length) return;
      // Marcar todas como resueltas (actualiza en base)
      const ids = unresolvedAlerts.map(a => a.id);
      const fecha_resolucion = new Date().toISOString();
      const {
        error
      } = await supabase.from('alertas').update({
        resuelto: true,
        resolucion: "Resuelto en lote",
        fecha_resolucion
      }).in('id', ids);
      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron resolver todas las alertas",
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Éxito",
        description: "Todas las alertas fueron resueltas"
      });
      await queryClient.invalidateQueries({
        queryKey: ['alerts']
      });
    } catch (error) {
      console.error('Error resolving all alerts:', error);
    }
  };
  const handleDeleteResolvedAlerts = async () => {
    if (!alerts || !alerts.length) return;
    try {
      const resolvedAlerts = alerts.filter(a => a.resuelto);
      if (resolvedAlerts.length === 0) return;
      toast({
        title: "Eliminando...",
        description: "Moviendo alertas resueltas al historial."
      });

      // Primero, guardar en historial
      const historialInserts = resolvedAlerts.map(alert => ({
        alerta_original_id: alert.id,
        tipo: alert.tipo,
        mensaje: alert.mensaje,
        pozo_id: alert.pozo?.id || '',
        created_at: alert.created_at,
        resuelto: alert.resuelto,
        fecha_resolucion: alert.fecha_resolucion,
        resolucion: alert.resolucion,
        valor: alert.valor,
        unidad: alert.unidad,
        eliminado_at: new Date().toISOString()
      }));

      // Insertar todas al historial de alertas
      const {
        error: insertHistError
      } = await supabase.from('alertas_historial').insert(historialInserts);
      if (insertHistError) {
        console.error("Error insertando historial:", insertHistError);
        toast({
          title: "Error",
          description: "No se pudo guardar el historial antes de eliminar.",
          variant: "destructive"
        });
        return;
      }
      const ids = resolvedAlerts.map(alert => alert.id);
      // Eliminar las alertas resueltas de la tabla principal
      const {
        error: deleteError
      } = await supabase.from('alertas').delete().in('id', ids);
      if (deleteError) {
        console.error("Error eliminando alertas resueltas:", deleteError);
        toast({
          title: "Error",
          description: "No se pudieron eliminar las alertas resueltas.",
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Resueltas eliminadas",
        description: "Las alertas resueltas fueron movidas al historial y eliminadas."
      });
      await queryClient.invalidateQueries({
        queryKey: ['alerts']
      });
    } catch (err) {
      console.error("Error en eliminación de alertas resueltas:", err);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar las alertas resueltas.",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-[#1C2526] text-white font-sans">
      <AlertsNavigation />

      <div className="container flex justify-center pt-4 gap-3 py-[32px] mx-0 px-0">
        <button className="bg-pozo-orange text-white rounded px-4 py-2 font-semibold shadow hover:bg-orange-500 transition" onClick={handleResolveAllAlerts} disabled={!alerts || alerts.length === 0 || alerts.every(a => a.resuelto)}>
          Resolver todas
        </button>
        <button className="bg-red-600 text-white rounded px-4 py-2 font-semibold shadow hover:bg-red-700 transition" onClick={handleDeleteResolvedAlerts} disabled={!alerts || alerts.filter(a => a.resuelto).length === 0}>
          Eliminar resueltas
        </button>
      </div>

      <div className="container mx-auto px-0">
        <AlertFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} selectedWellId={selectedWellId} onWellChange={setSelectedWellId} wells={wells || []} />
        
        <div className="mx-4 mb-6 bg-[#1C2526] rounded-lg p-4 border border-gray-700">
          <PressureChart data={pressureData || []} />
        </div>
        
        <div className="px-4 pb-24">
          <AlertList alerts={alerts as Alert[] | undefined} isLoading={isLoading} onAlertResolved={handleAlertResolved} />
        </div>
      </div>
    </div>;
};
export default Alerts;