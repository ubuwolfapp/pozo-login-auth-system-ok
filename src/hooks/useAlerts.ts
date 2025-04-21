
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertType, Alert } from '@/types/alerts';
import { useToast } from '@/hooks/use-toast';
import { alertService } from '@/services/alertService';
import { supabase } from '@/integrations/supabase/client';

export function useAlerts(activeFilter: AlertType, selectedWellId: string | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener las alertas filtradas
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', activeFilter, selectedWellId],
    queryFn: async () => {
      const allAlerts = await alertService.fetchAlerts();
      
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
  });

  // Query para datos de presión
  const { data: pressureData } = useQuery({
    queryKey: ['pressure-history', selectedWellId],
    queryFn: async () => {
      if (selectedWellId) {
        try {
          // Verify user has access to this well using RPC
          const { data: userData } = await supabase.auth.getUser();
          const userId = userData.user?.id;
          
          if (!userId) {
            console.log('No user is logged in, using sample data');
            return generateSamplePressureData();
          }
          
          // Check well assignment using RPC
          const { data: hasAccess, error: accessError } = await supabase.rpc(
            'check_well_user_assignment',
            { p_usuario_id: userId, p_pozo_id: selectedWellId }
          );
          
          if (accessError || !hasAccess) {
            console.log('Well is not assigned to current user, using sample data');
            return generateSamplePressureData();
          }
          
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
      
      return generateSamplePressureData();
    }
  });

  // Función para generar datos de ejemplo
  function generateSamplePressureData() {
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

  // Funciones para manejar alertas
  const handleAlertResolved = async (alertId: string, resolutionText: string) => {
    try {
      setIsSubmitting(true);
      await alertService.resolveAlert(alertId, resolutionText);
      
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveAllAlerts = async () => {
    if (!alerts || !alerts.length) return;
    
    try {
      const unresolvedAlerts = alerts.filter(a => !a.resuelto);
      if (!unresolvedAlerts.length) return;
      
      const ids = unresolvedAlerts.map(a => a.id);
      await alertService.resolveAllAlerts(ids);
      
      toast({
        title: "Éxito",
        description: "Todas las alertas fueron resueltas",
      });
      
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
    } catch (error) {
      console.error('Error resolving all alerts:', error);
      toast({
        title: "Error",
        description: "No se pudieron resolver todas las alertas",
        variant: "destructive"
      });
    }
  };

  const handleAlertDeleted = async (alertId: string) => {
    try {
      await alertService.deleteAlert(alertId);

      toast({
        title: "Alerta eliminada",
        description: "La alerta fue eliminada correctamente.",
      });

      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Hubo un error inesperado al borrar la alerta.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAllAlerts = async () => {
    if (!alerts || alerts.length === 0) return;
    
    try {
      await alertService.deleteAllAlerts();

      toast({
        title: "Éxito",
        description: "Todas las alertas fueron eliminadas.",
      });
      
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
    } catch (error) {
      console.error('Error deleting all alerts:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al borrar las alertas.",
        variant: "destructive"
      });
    }
  };

  return {
    alerts,
    isLoading,
    pressureData,
    isSubmitting,
    handleAlertResolved,
    handleResolveAllAlerts,
    handleAlertDeleted,
    handleDeleteAllAlerts
  };
}
