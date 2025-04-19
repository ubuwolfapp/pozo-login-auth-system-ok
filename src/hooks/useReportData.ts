
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface ReportData {
  pozo_nombre: string;
  fechas: string[];
  valores: number[];
  resumen: {
    parametro: string;
    valor: string;
    estado: string;
  }[];
}

export function useReportData(selectedParameter: string) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (selectedParameter === 'presion') {
          const { data: pressureData, error } = await supabase
            .from('presion_historial')
            .select('fecha, valor')
            .order('fecha', { ascending: true });

          if (error) throw error;

          if (pressureData) {
            setReportData({
              pozo_nombre: "Pozo #1",
              fechas: pressureData.map(d => d.fecha),
              valores: pressureData.map(d => d.valor),
              resumen: [
                { parametro: "presion", valor: "8500 psi", estado: "Pendiente" },
                { parametro: "temperatura", valor: "75°C", estado: "En Progreso" },
                { parametro: "dato3", valor: "Valor 3", estado: "Completado" }
              ]
            });
          }
        } else {
          setReportData({
            pozo_nombre: "Pozo #1",
            fechas: [
              "2025-04-01", "2025-04-02", "2025-04-03", "2025-04-04",
              "2025-04-05", "2025-04-06", "2025-04-07", "2025-04-08",
              "2025-04-09", "2025-04-10", "2025-04-11", "2025-04-12",
              "2025-04-13", "2025-04-14", "2025-04-15", "2025-04-16"
            ],
            valores: [2000, 2500, 3000, 2000, 3500, 3000, 2500, 4000, 3000, 3500, 2000, 2500, 3000, 3500, 4000, 3000],
            resumen: [
              { parametro: "presion", valor: "8500 psi", estado: "Pendiente" },
              { parametro: "temperatura", valor: "75°C", estado: "En Progreso" },
              { parametro: "dato3", valor: "Valor 3", estado: "Completado" }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedParameter]);

  return { reportData, isLoading };
}
