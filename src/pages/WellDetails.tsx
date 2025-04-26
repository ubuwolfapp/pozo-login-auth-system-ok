
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import NavigationBar from '@/components/NavigationBar';
import { wellService } from '@/services/wellService';
import WellPhotos from '@/components/wells/WellPhotos';
import WellCameras from '@/components/wells/WellCameras';
import WellStats from '@/components/wells/WellStats';
import WellHeader from '@/components/wells/WellHeader';
import WellPressureChart from '@/components/wells/WellPressureChart';
import WellAlertHistoryModal from '@/components/wells/WellAlertHistoryModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const WellDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: well, isLoading } = useQuery({
    queryKey: ['well', id],
    queryFn: () => wellService.getWellById(id!),
  });

  const handlePhotoUpload = () => {
    queryClient.invalidateQueries({
      queryKey: ['wellPhotos', well?.id]
    });
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      // First, copy the alert to history
      const { data: alert } = await supabase
        .from('alertas')
        .select('*')
        .eq('id', alertId)
        .single();

      if (alert) {
        await supabase
          .from('alertas_historial')
          .insert({
            ...alert,
            alerta_original_id: alert.id
          });
      }

      // Then delete the alert
      await supabase
        .from('alertas')
        .delete()
        .eq('id', alertId);

      toast({
        title: "Alerta eliminada",
        description: "La alerta ha sido eliminada correctamente",
      });

      // Refresh alerts
      queryClient.invalidateQueries({
        queryKey: ['alerts']
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la alerta",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await supabase
        .from('tareas')
        .delete()
        .eq('id', taskId);

      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada correctamente",
      });

      // Refresh tasks
      queryClient.invalidateQueries({
        queryKey: ['tasks']
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pozo-orange"></div>
      </div>;
  }

  if (!well) {
    return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No se encontró el pozo</h2>
          <p>El pozo que estás buscando no existe o no tienes permisos para verlo.</p>
        </div>
      </div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="container mx-auto px-4 py-6">
        <WellHeader 
          wellName={well.nombre}
          wellId={well.id}
          onPhotoUpload={handlePhotoUpload}
          onShowAlertHistory={() => setHistoryOpen(true)}
          onAddTask={() => navigate(`/tasks?openModal=true&well=${well.id}`)}
          onAdjustSettings={() => navigate('/settings')}
        />

        <WellAlertHistoryModal
          wellId={well.id}
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          onDeleteAlert={handleDeleteAlert}
        />

        <div className="space-y-6">
          <WellPressureChart wellId={well.id} />
          <WellStats 
            well={well}
            onDeleteAlert={handleDeleteAlert}
            onDeleteTask={handleDeleteTask}
          />
          <WellPhotos wellId={well.id} />
          <WellCameras wellId={well.id} />
        </div>
      </div>
      <NavigationBar />
    </div>
  );
};

export default WellDetails;
