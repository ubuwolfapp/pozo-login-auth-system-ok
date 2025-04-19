
import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ProductionChart from './ProductionChart';
import { ReportData } from '@/hooks/useReportData';

interface ReportChartProps {
  reportData: ReportData;
}

const ReportChart = ({ reportData }: ReportChartProps) => {
  const chartData = reportData.fechas.map((date, index) => {
    return {
      date: format(parseISO(date), "d MMM", { locale: es }).replace('.', ''),
      valor: reportData.valores[index]
    };
  });

  return <ProductionChart chartData={chartData} />;
};

export default ReportChart;
