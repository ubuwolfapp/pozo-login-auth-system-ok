
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeftIcon, 
  CalendarIcon, 
  ChevronDownIcon, 
  ChevronRightIcon
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import NavigationBar from '@/components/NavigationBar';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import ParameterSummary from '@/components/reports/ParameterSummary';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2">
              <CalendarIcon className="h-6 w-6 text-cyan-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0 bg-slate-800 border-slate-700">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => date && setEndDate(date)}
              className="bg-slate-800 border-slate-700 text-white pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </header>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p>Cargando datos...</p>
        </div>
      ) : (
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {/* Well selector */}
          <div 
            onClick={handleWellSelect}
            className="bg-[#2A3441] p-4 rounded-lg flex justify-between items-center cursor-pointer"
          >
            <span>{reportData?.pozo_nombre || "Seleccionar pozo"}</span>
            <ChevronDownIcon className="h-5 w-5" />
          </div>

          {/* Date range */}
          <div className="bg-[#2A3441] p-4 rounded-lg">
            <span>{formattedStartDate} - {formattedEndDate}</span>
          </div>

          {/* Parameter selector */}
          <div 
            onClick={handleParameterSelect}
            className="bg-[#2A3441] p-4 rounded-lg flex justify-between items-center cursor-pointer"
          >
            <span>Parámetros</span>
            <div className="flex items-center">
              <span className="mr-2">Producción</span>
              <ChevronRightIcon className="h-5 w-5" />
            </div>
          </div>

          {/* Chart */}
          <div className="bg-[#2A3441] p-4 rounded-lg">
            <h3 className="mb-4 text-lg">producción diaria</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'white', fontSize: 10 }}
                    tickFormatter={(value) => value}
                  />
                  <YAxis 
                    tick={{ fill: 'white', fontSize: 10 }}
                    domain={[0, 4000]}
                    ticks={[0, 1000, 2000, 3000, 4000]}
                    label={{ 
                      value: 'barriles', 
                      angle: -90, 
                      position: 'insideLeft',
                      fill: 'white',
                      fontSize: 12
                    }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-800 border border-slate-700 p-2 rounded">
                            <p>{`${payload[0].value} barriles`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="valor" fill="#FF6200" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

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

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2 mb-20">
            <Button 
              onClick={handleGeneratePDF}
              className="bg-[#FF6200] hover:bg-[#FF6200]/80 text-white py-3"
            >
              Generar PDF
            </Button>
            <Button 
              onClick={handleSendEmail}
              className="bg-[#FF6200] hover:bg-[#FF6200]/80 text-white py-3"
            >
              Enviar por Correo
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <NavigationBar />
    </div>
  );
};

export default Reports;
