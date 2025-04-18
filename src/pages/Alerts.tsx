
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Bell, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Alert {
  id: string;
  pozo_id: string;
  tipo: 'critica' | 'advertencia';
  mensaje: string;
  valor?: number;
  unidad?: string;
  created_at: string;
  resuelto: boolean;
  pozo: {
    nombre: string;
  };
}

const Alerts = () => {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alertas')
        .select(`
          *,
          pozo:pozos(nombre)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Alert[];
    }
  });

  const markAsResolved = async (alertId: string) => {
    await supabase
      .from('alertas')
      .update({ resuelto: true })
      .eq('id', alertId);
  };

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'critica':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'advertencia':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Cargando alertas...</div>;
  }

  return (
    <div className="min-h-screen bg-[#1C2526] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Alertas</h1>
        
        <div className="space-y-4">
          {alerts?.map((alert) => (
            <Card 
              key={alert.id}
              className="bg-[#2E3A59] border-none p-4 text-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  {getAlertIcon(alert.tipo)}
                  <div>
                    <p className="font-medium mb-1">{alert.mensaje}</p>
                    <div className="flex gap-4 text-sm text-gray-300">
                      <span>{alert.pozo.nombre}</span>
                      <span>•</span>
                      <span>{format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm')}</span>
                      {alert.valor && alert.unidad && (
                        <>
                          <span>•</span>
                          <span>{alert.valor} {alert.unidad}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {!alert.resuelto && (
                  <Button
                    onClick={() => markAsResolved(alert.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marcar como resuelta
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
      </div>
    </div>
  );
};

export default Alerts;
