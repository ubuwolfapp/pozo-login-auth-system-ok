
import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Alert } from '@/types/alerts';

interface AlertListProps {
  alerts: Alert[] | undefined;
  isLoading: boolean;
}

const AlertList = ({ alerts, isLoading }: AlertListProps) => {
  const queryClient = useQueryClient();

  const markAsResolved = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alertas')
        .update({ resuelto: true })
        .eq('id', alertId);
      
      if (error) throw error;
      
      toast({
        title: "Alerta resuelta",
        description: "La alerta ha sido marcada como resuelta",
      });
      
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo resolver la alerta",
        variant: "destructive",
      });
      console.error("Error resolving alert:", error);
    }
  };

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'critica':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'advertencia':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-6 w-6" />;
    }
  };

  const getAlertBackground = (tipo: string) => {
    switch (tipo) {
      case 'critica':
        return 'bg-[#8B0000]';
      case 'advertencia':
        return 'bg-[#2F4F4F]';
      default:
        return 'bg-[#2E3A59]';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-white">Cargando...</div>;
  }

  if (!alerts?.length) {
    return <div className="text-center py-8 text-white">No hay alertas que mostrar</div>;
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card 
          key={alert.id}
          className={`border-none p-4 text-white ${getAlertBackground(alert.tipo)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              {getAlertIcon(alert.tipo)}
              <div>
                <p className="font-medium mb-1">{alert.mensaje}</p>
                <p className="text-sm text-gray-300">
                  {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>
            
            {!alert.resuelto && (
              <Button
                onClick={() => markAsResolved(alert.id)}
                className="bg-[#2F4F4F] hover:bg-[#3A5A5A] text-white"
              >
                Resolver
              </Button>
            )}
            
            {alert.resuelto && (
              <span className="text-green-500 flex items-center">
                <Check className="h-4 w-4 mr-1" />
                Resuelta
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AlertList;
