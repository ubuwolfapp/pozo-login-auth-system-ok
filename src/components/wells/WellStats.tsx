
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Well } from '@/services/wellService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WellStatsProps {
  well: Well;
  onDeleteAlert?: (alertId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

const WellStats = ({ well, onDeleteAlert, onDeleteTask }: WellStatsProps) => {
  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts', well.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('alertas')
        .select('*')
        .eq('pozo_id', well.id)
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', well.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('tareas')
        .select('*')
        .eq('pozo_id', well.id)
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 bg-slate-800">
        <h3 className="text-xl font-semibold mb-4">Alertas Activas</h3>
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-start justify-between p-3 bg-slate-700 rounded-lg">
              <div>
                <p className="font-medium">{alert.mensaje}</p>
                <p className="text-sm text-gray-400">
                  {new Date(alert.created_at).toLocaleDateString()}
                </p>
              </div>
              {onDeleteAlert && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-800 text-white border-slate-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Esta acción no se puede deshacer. La alerta se moverá al historial.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteAlert(alert.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="text-gray-400">No hay alertas activas</p>
          )}
        </div>
      </Card>

      <Card className="p-6 bg-slate-800">
        <h3 className="text-xl font-semibold mb-4">Tareas Pendientes</h3>
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="flex items-start justify-between p-3 bg-slate-700 rounded-lg">
              <div>
                <p className="font-medium">{task.titulo}</p>
                <p className="text-sm text-gray-400">
                  {new Date(task.created_at).toLocaleDateString()}
                </p>
              </div>
              {onDeleteTask && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-800 text-white border-slate-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteTask(task.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-gray-400">No hay tareas pendientes</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WellStats;
