
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

export function useReportData(selectedParameter: string, startDate?: Date, endDate?: Date) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Formatear fechas para la consulta
        const formattedStartDate = startDate ? startDate.toISOString() : new Date(new Date().setDate(new Date().getDate() - 15)).toISOString();
        const formattedEndDate = endDate ? endDate.toISOString() : new Date().toISOString();

        if (selectedParameter === 'presion') {
          const { data: pressureData, error } = await supabase
            .from('presion_historial')
            .select('fecha, valor')
            .gte('fecha', formattedStartDate)
            .lte('fecha', formattedEndDate)
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
          // Para otros parámetros, generamos datos de ejemplo dentro del rango de fechas
          const fechas = [];
          const valores = [];
          
          // Generar datos para cada día en el rango
          const currentDate = new Date(startDate || new Date(new Date().setDate(new Date().getDate() - 15)));
          const end = new Date(endDate || new Date());
          
          while (currentDate <= end) {
            fechas.push(currentDate.toISOString());
            
            // Generar un valor aleatorio entre 2000 y 4000
            const randomValue = Math.floor(Math.random() * 2000) + 2000;
            valores.push(randomValue);
            
            // Avanzar al día siguiente
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          setReportData({
            pozo_nombre: "Pozo #1",
            fechas: fechas,
            valores: valores,
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
  }, [selectedParameter, startDate, endDate]);

  return { reportData, isLoading };
}
