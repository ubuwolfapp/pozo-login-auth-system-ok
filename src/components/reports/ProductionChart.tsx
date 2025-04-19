
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProductionChartProps {
  chartData: {
    date: string;
    valor: number;
  }[];
}

const ProductionChart = ({ chartData }: ProductionChartProps) => {
  return (
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
  );
};

export default ProductionChart;
