
import React from 'react';
import ParameterSummary from './ParameterSummary';
import { ReportData } from '@/hooks/useReportData';
import { toast } from '@/components/ui/use-toast';

interface ReportSummaryProps {
  reportData: ReportData;
}

const ReportSummary = ({ reportData }: ReportSummaryProps) => {
  const handleAddStatus = () => {
    toast({
      title: "Agregar estado",
      description: "Aquí se abriría un modal para agregar estado"
    });
  };

  return (
    <div className="bg-[#2A3441] p-4 rounded-lg">
      {reportData.resumen.map((param, index) => (
        <ParameterSummary
          key={index}
          parameter={param.parametro}
          value={param.valor}
          status={param.estado}
          onAddStatus={param.estado ? undefined : handleAddStatus}
        />
      ))}
    </div>
  );
};

export default ReportSummary;
