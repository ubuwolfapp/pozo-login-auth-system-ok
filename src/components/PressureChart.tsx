
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { format } from 'date-fns';

interface PressureData {
  fecha: string;
  valor: number;
}

interface PressureChartProps {
  data: PressureData[];
}

const PressureChart = ({ data }: PressureChartProps) => {
  const formattedData = data.map(point => ({
    ...point,
    hora: format(new Date(point.fecha), 'HH:mm'),
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={formattedData}>
        <CartesianGrid stroke="#333" />
        <XAxis 
          dataKey="hora"
          tick={{ fill: 'white', fontSize: 10 }}
          axisLine={{ stroke: '#555' }}
        />
        <YAxis 
          domain={['auto', 'auto']}
          tick={{ fill: 'white', fontSize: 10 }}
          axisLine={{ stroke: '#555' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1C2526',
            border: '1px solid #333',
            borderRadius: '4px'
          }}
          labelStyle={{ color: 'white' }}
          itemStyle={{ color: 'white' }}
          formatter={(value: number) => [`${value} PSI`, 'Presión']}
          labelFormatter={(label) => `Hora: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="valor" 
          stroke="#00A1D6" 
          strokeWidth={2}
          dot={{ fill: '#00A1D6', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PressureChart;
