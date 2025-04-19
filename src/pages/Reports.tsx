import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { toast } from '@/components/ui/use-toast';
import NavigationBar from '@/components/NavigationBar';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ProductionChart from '@/components/reports/ProductionChart';
import WellSelector from '@/components/reports/WellSelector';
import DateSelector from '@/components/reports/DateSelector';
import ParameterSelector from '@/components/reports/ParameterSelector';
import ParameterSummary from '@/components/reports/ParameterSummary';
import ReportActions from '@/components/reports/ReportActions';

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
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 15))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Datos estáticos para demostración
  const staticData = {
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
      { parametro: "idioma", valor: "Idioma", estado: "" }
    ]
  };

  useEffect(() => {
    // Simular carga de datos (en producción, esto haría una petición a la API)
    setTimeout(() => {
      setReportData(staticData);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleWellSelect = () => {
    toast({
      title: "Selección de pozo",
      description: "Aquí se abriría el selector de pozos"
    });
  };

  const handleParameterSelect = () => {
    toast({
      title: "Selección de parámetro",
      description: "Aquí se abriría el selector de parámetros"
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

  // Formatear fechas para mostrar
  const formattedStartDate = format(startDate, "dd/MM/yyyy");
  const formattedEndDate = format(endDate, "dd/MM/yyyy");

  // Formatear datos para el gráfico
  const chartData = reportData?.fechas.map((date, index) => {
    return {
      date: format(parseISO(date), "d MMM", { locale: es }).replace('.', ''),
      valor: reportData.valores[index]
    };
  }) || [];

  return (
    <div className="flex flex-col min-h-screen bg-[#1C2526] text-white font-sans pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-gray-700">
        <button onClick={handleBack} className="p-2">
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">Reportes</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </header>

      {/* Content */}
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
          
          <ParameterSelector onSelect={handleParameterSelect} />
          
          <ProductionChart chartData={chartData} />

          {/* Parameter summary */}
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

          <ReportActions 
            onGeneratePDF={handleGeneratePDF}
            onSendEmail={handleSendEmail}
          />
        </div>
      )}

      {/* Navigation Bar */}
      <NavigationBar />
    </div>
  );
};

export default Reports;
