import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { toast } from '@/components/ui/use-toast';
import NavigationBar from '@/components/NavigationBar';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import ProductionChart from '@/components/reports/ProductionChart';
import WellSelector from '@/components/reports/WellSelector';
import DateSelector from '@/components/reports/DateSelector';
import ParameterSelector from '@/components/reports/ParameterSelector';
import ParameterSummary from '@/components/reports/ParameterSummary';
import ReportActions from '@/components/reports/ReportActions';
import WellPhotos from '@/components/wells/WellPhotos';
import WellCameras from '@/components/wells/WellCameras';

interface ReportData {
  pozo_nombre: string;
  fechas: string[];
  valores: number[];
  resumen: {
    parametro: string;
    valor: string;
    estado: string;
  }[];
}

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState('produccion');
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 15))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());

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

  const handleBack = () => {
    navigate(-1);
  };

  const handleWellSelect = () => {
    toast({
      title: "Selección de pozo",
      description: "Aquí se abriría el selector de pozos"
    });
  };

  const handleParameterSelect = (parameter: string) => {
    setSelectedParameter(parameter);
    toast({
      title: "Parámetro seleccionado",
      description: `Se ha seleccionado: ${parameter}`
    });
  };

  const handleAddStatus = () => {
    toast({
      title: "Agregar estado",
      description: "Aquí se abriría un modal para agregar estado"
    });
  };

  const handleGeneratePDF = () => {
    toast({
      title: "PDF generado",
      description: "El PDF ha sido generado correctamente"
    });
  };

  const handleSendEmail = () => {
    toast({
      title: "Correo enviado",
      description: "El reporte ha sido enviado por correo correctamente"
    });
  };

  const formattedStartDate = format(startDate, "dd/MM/yyyy");
  const formattedEndDate = format(endDate, "dd/MM/yyyy");

  const chartData = reportData?.fechas.map((date, index) => {
    return {
      date: format(parseISO(date), "d MMM", { locale: es }).replace('.', ''),
      valor: reportData.valores[index]
    };
  }) || [];

  const wellId = "demo-well-1";

  return (
    <div className="flex flex-col min-h-screen bg-[#1C2526] text-white font-sans pb-20">
      <header className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-gray-700">
        <button onClick={handleBack} className="p-2">
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">Reportes</h1>
        <div className="w-10" />
      </header>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p>Cargando datos...</p>
        </div>
      ) : (
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          <WellSelector 
            wellName={reportData?.pozo_nombre} 
            onSelect={handleWellSelect} 
          />
          
          <DateSelector 
            startDate={startDate}
            endDate={endDate}
            onEndDateSelect={(date) => date && setEndDate(date)}
          />
          
          <ParameterSelector 
            onSelect={handleParameterSelect}
            selectedParameter={selectedParameter}
          />
          
          <ProductionChart chartData={chartData} />

          <div className="bg-[#2A3441] p-4 rounded-lg">
            {reportData?.resumen.map((param, index) => (
              <ParameterSummary
                key={index}
                parameter={param.parametro}
                value={param.valor}
                status={param.estado}
                onAddStatus={param.estado ? undefined : handleAddStatus}
              />
            ))}
          </div>

          <WellPhotos wellId={wellId} />
          <WellCameras wellId={wellId} />

          <ReportActions 
            onGeneratePDF={handleGeneratePDF}
            onSendEmail={handleSendEmail}
          />
        </div>
      )}

      <NavigationBar />
    </div>
  );
};

export default Reports;
