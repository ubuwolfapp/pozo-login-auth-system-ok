
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { AlertCircle, BookOpen, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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

interface WellAlertHistoryModalProps {
  wellId: string;
  open: boolean;
  onClose: () => void;
  onDeleteAlert?: (alertId: string) => void;
}

const WellAlertHistoryModal: React.FC<WellAlertHistoryModalProps> = ({ wellId, open, onClose, onDeleteAlert }) => {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alert-history', wellId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alertas_historial')
        .select('*')
        .eq('pozo_id', wellId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C2526] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Historial de Alertas
          </DialogTitle>
        </DialogHeader>
        {isLoading && <div className="py-8 text-center">Cargando historial...</div>}
        {!isLoading && (!alerts || alerts.length === 0) && (
          <div className="py-8 text-center text-gray-400">
            <AlertCircle className="mx-auto mb-1" />
            No hay alertas en el historial.
          </div>
        )}
        {!isLoading && alerts && alerts.length > 0 && (
          <div className="max-h-[380px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Resolución</TableHead>
                  {onDeleteAlert && <TableHead className="w-16">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <span className={alert.tipo === 'critica' ? 'text-red-400' : alert.tipo === 'advertencia' ? 'text-yellow-300' : ''}>
                        {alert.mensaje}
                      </span>
                    </TableCell>
                    <TableCell>
                      {alert.tipo}
                    </TableCell>
                    <TableCell>
                      <div className="whitespace-pre-line">{alert.resolucion || '-'}</div>
                    </TableCell>
                    {onDeleteAlert && (
                      <TableCell>
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
                                onClick={() => onDeleteAlert(alert.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WellAlertHistoryModal;
