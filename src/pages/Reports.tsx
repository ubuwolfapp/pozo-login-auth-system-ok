
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import NavigationBar from '@/components/NavigationBar';
import ProductionChart from '@/components/reports/ProductionChart';
import WellSelector from '@/components/reports/WellSelector';
import DateSelector from '@/components/reports/DateSelector';
import ParameterSelector from '@/components/reports/ParameterSelector';
import ParameterSummary from '@/components/reports/ParameterSummary';
import ReportActions from '@/components/reports/ReportActions';
import WellPhotos from '@/components/wells/WellPhotos';
import WellCameras from '@/components/wells/WellCameras';
import ReportHeader from '@/components/reports/ReportHeader';
import ReportLoading from '@/components/reports/ReportLoading';
import { useReportData } from '@/hooks/useReportData';
import { toast } from '@/components/ui/use-toast';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [selectedParameter, setSelectedParameter] = useState('produccion');
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 15))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const { reportData, isLoading } = useReportData(selectedParameter);

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

  const chartData = reportData?.fechas.map((date, index) => {
    return {
      date: format(parseISO(date), "d MMM", { locale: es }).replace('.', ''),
      valor: reportData.valores[index]
    };
  }) || [];

  const wellId = "demo-well-1";

  return (
    <div className="flex flex-col min-h-screen bg-[#1C2526] text-white font-sans pb-20">
      <ReportHeader onBack={handleBack} />

      {isLoading ? (
        <ReportLoading />
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
