
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  date: string;
  valor: number;
}

interface ProductionChartProps {
  chartData: ChartData[];
}

const ProductionChart = ({ chartData }: ProductionChartProps) => {
  return (
    <div className="bg-[#2A3441] p-4 rounded-lg">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.375rem'
              }}
              itemStyle={{ color: '#E5E7EB' }}
              labelStyle={{ color: '#E5E7EB' }}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#00A1D6"
              strokeWidth={2}
              dot={{ fill: '#00A1D6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductionChart;
