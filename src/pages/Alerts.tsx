
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, ArrowLeft, Filter, Check, Home, BarChart3, FileText, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

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

// Datos ficticios para el gráfico
const chartData = [
  { hora: '01:00', presion: 7.5 },
  { hora: '02:30', presion: 8.0 },
  { hora: '04:00', presion: 9.0 },
  { hora: '05:30', presion: 10.0 },
  { hora: '07:00', presion: 8.5 },
  { hora: '08:30', presion: 7.0 },
  { hora: '10:00', presion: 9.0 },
  { hora: '11:30', presion: 8.0 },
  { hora: '13:00', presion: 7.5 },
];

type FilterType = 'todas' | 'criticas' | 'resueltas';

const Alerts = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', activeFilter],
    queryFn: async () => {
      let query = supabase
        .from('alertas')
        .select(`
          *,
          pozo:pozos(nombre)
        `);
      
      if (activeFilter === 'criticas') {
        query = query.eq('tipo', 'critica');
      } else if (activeFilter === 'resueltas') {
        query = query.eq('resuelto', true);
      }
      
      // Always sort by date, most recent first
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Alert[];
    }
  });

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
      
      // Refetch alerts to update the UI
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

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleFilterButtonClick = () => {
    toast({
      title: "Filtro",
      description: "Función de filtro no implementada",
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-[#1C2526] text-white">Cargando alertas...</div>;
  }

  return (
    <div className="min-h-screen bg-[#1C2526] text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#1C2526]">
        <button onClick={() => navigate('/dashboard')} className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">Alertas</h1>
        <button onClick={handleFilterButtonClick} className="text-white">
          <Filter className="h-6 w-6" />
        </button>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex justify-between px-4 mb-4">
        <button
          onClick={() => handleFilterClick('todas')}
          className={`flex-1 py-2 rounded-l-lg ${activeFilter === 'todas' ? 'bg-[#2E3A59]' : 'bg-[#1C2526]'}`}
        >
          Todas
        </button>
        <button
          onClick={() => handleFilterClick('criticas')}
          className={`flex-1 py-2 ${activeFilter === 'criticas' ? 'bg-[#2E3A59]' : 'bg-[#1C2526]'}`}
        >
          Críticas
        </button>
        <button
          onClick={() => handleFilterClick('resueltas')}
          className={`flex-1 py-2 rounded-r-lg ${activeFilter === 'resueltas' ? 'bg-[#2E3A59]' : 'bg-[#1C2526]'}`}
        >
          Resueltas
        </button>
      </div>
      
      {/* Chart */}
      <div className="mx-4 mb-4 bg-[#1C2526] rounded-lg p-4 border border-gray-700">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#333" />
            <XAxis 
              dataKey="hora"
              tick={{ fill: 'white', fontSize: 10 }}
              axisLine={{ stroke: '#555' }}
            />
            <YAxis 
              domain={[0, 10]}
              tick={{ fill: 'white', fontSize: 10 }}
              axisLine={{ stroke: '#555' }}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Line 
              type="monotone" 
              dataKey="presion" 
              stroke="#00A1D6" 
              strokeWidth={2}
              dot={{ fill: '#00A1D6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Alerts List */}
      <div className="px-4 pb-24 space-y-4">
        {alerts?.length === 0 ? (
          <div className="text-center py-8">No hay alertas que mostrar</div>
        ) : (
          alerts?.map((alert) => (
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
          ))
        )}
      </div>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1C2526] px-6 py-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <Home 
            className="text-gray-400 h-6 w-6 cursor-pointer hover:text-white transition-colors" 
            onClick={() => navigate('/dashboard')}
          />
          <AlertTriangle 
            className="text-[#FF6200] h-6 w-6 cursor-pointer" 
          />
          <BarChart3 className="text-gray-400 h-6 w-6 cursor-pointer hover:text-white transition-colors" />
          <FileText className="text-gray-400 h-6 w-6 cursor-pointer hover:text-white transition-colors" />
          <Settings className="text-gray-400 h-6 w-6 cursor-pointer hover:text-white transition-colors" />
        </div>
      </nav>
    </div>
  );
};

export default Alerts;
