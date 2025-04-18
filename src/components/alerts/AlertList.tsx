
import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/types/alerts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface AlertListProps {
  alerts: Alert[] | undefined;
  isLoading: boolean;
  onAlertResolved?: (alertId: string, resolutionText: string) => void;
}

const AlertList = ({ alerts, isLoading, onAlertResolved }: AlertListProps) => {
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null);
  const [resolutionText, setResolutionText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getAlertBackground = (tipo: string, resuelto?: boolean) => {
    if (resuelto) {
      return 'bg-[#BDE0FE]/80';
    }
    
    switch (tipo) {
      case 'critica':
        return 'bg-[#8B0000]/80';
      case 'advertencia':
        return 'bg-[#2F4F4F]/80';
      default:
        return 'bg-[#2E3A59]/80';
    }
  };

  const getAlertIcon = (tipo: string) => {
    return (
      <AlertTriangle className={`h-6 w-6 ${tipo === 'critica' ? 'text-red-500' : 'text-yellow-500'}`} />
    );
  };

  const handleResolveClick = async () => {
    if (!selectedAlert) return;
    
    try {
      setIsSubmitting(true);
      
      console.log("Resolving alert:", selectedAlert.id, "Resolution text:", resolutionText);
      
      // Call the parent component's callback to handle resolution
      if (onAlertResolved) {
        await onAlertResolved(selectedAlert.id, resolutionText);
      }
      
      // Close the dialog after successful resolution
      setSelectedAlert(null);
      setResolutionText("");
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast({
        title: "Error",
        description: "No se pudo resolver la alerta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-white">Cargando...</div>;
  }

  if (!alerts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-lg font-medium">No hay alertas que mostrar</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {alerts?.map((alert) => (
          <Card 
            key={alert.id}
            className={`${getAlertBackground(alert.tipo, alert.resuelto)} border-none p-4`}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                {getAlertIcon(alert.tipo)}
                <div>
                  <p className="font-medium mb-1 text-white">{alert.mensaje}</p>
                  <p className="text-sm text-white">
                    {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                  {alert.resuelto && alert.fecha_resolucion && (
                    <p className="text-sm text-white mt-1">
                      Resuelto: {format(new Date(alert.fecha_resolucion), 'dd/MM/yyyy HH:mm')}
                    </p>
                  )}
                </div>
              </div>
              
              {!alert.resuelto ? (
                <Button
                  onClick={() => setSelectedAlert(alert)}
                  variant="secondary"
                  className="bg-[#2F4F4F] hover:bg-[#3A5A5A] text-white"
                >
                  Resolver
                </Button>
              ) : (
                <span className="text-white flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Resuelta
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="bg-[#1C2526] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Resolver Alerta</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Escriba aquí la resolución..."
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              className="bg-[#2E3A59] border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setSelectedAlert(null)}
              className="bg-gray-600 hover:bg-gray-700 text-white"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResolveClick}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertList;
