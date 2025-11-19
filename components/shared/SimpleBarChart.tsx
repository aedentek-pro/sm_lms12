import React from 'react';
import { Card } from './Card';

interface SimpleBarChartProps {
    title: string;
    data: {
        label: string;
        value: number;
        displayValue?: string;
    }[];
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ title, data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">{title}</h3>
      <div className="space-y-4 min-h-[10rem]">
        {data.length > 0 ? data.map(item => (
          <div key={item.label}>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-slate-600 truncate pr-2">{item.label}</span>
              <span className="font-semibold text-slate-800">{item.displayValue || item.value}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        )) : <p className="text-slate-500 text-center pt-8">No data available for this chart.</p>}
      </div>
    </Card>
  );
};
