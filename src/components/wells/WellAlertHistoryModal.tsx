
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { AlertCircle, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface WellAlertHistoryModalProps {
  wellId: string;
  open: boolean;
  onClose: () => void;
}

const WellAlertHistoryModal: React.FC<WellAlertHistoryModalProps> = ({ wellId, open, onClose }) => {
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
