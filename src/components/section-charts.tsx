import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

const data = Array.from({ length: 90 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (90 - i));
  
  return {
    fullDate: date,
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isPrimaryTick: i % 15 === 0, // Every 15 days is a primary tick
    Temperature: Math.round(22 + Math.sin(i * 0.2) * 5 + Math.random() * 2),
    'Previous Temperature': Math.round(20 + Math.sin(i * 0.2) * 4 + Math.random() * 2),
    Humidity: Math.round(45 + Math.sin(i * 0.15) * 10 + Math.random() * 5),
    'Previous Humidity': Math.round(40 + Math.sin(i * 0.15) * 8 + Math.random() * 5),
    CO2: Math.round(400 + Math.sin(i * 0.1) * 100 + Math.random() * 50),
    'Previous CO2': Math.round(380 + Math.sin(i * 0.1) * 80 + Math.random() * 50),
  };
});

const dataTypes = {
  Temperature: { unit: '°', color: 'var(--principal-green)' },
  Humidity: { unit: '%', color: 'var(--light-blue-2)' },
  CO2: { unit: 'ppm', color: 'var(--bad)' }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const unit = dataTypes[payload[0].dataKey as keyof typeof dataTypes]?.unit || '';
    return (
      <div className="bg-[var(--dark-blue-1)] border border-[var(--light-blue-1)] p-3 rounded-lg shadow-lg backdrop-blur-sm">
        <p className="text-xs font-medium text-[var(--text-muted)] mb-2">{label}</p>
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <p className="text-sm font-medium text-[var(--text-light)]">
              {item.value}{unit}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function SectionCharts() {
  const [timeRange, setTimeRange] = useState('3m');
  const [dataType, setDataType] = useState<keyof typeof dataTypes>('Temperature');

  const filterData = () => {
    switch (timeRange) {
      case '7d':
        return data.slice(-7);
      case '30d':
        return data.slice(-30);
      default:
        return data;
    }
  };

  const buttonBaseClass = "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 relative overflow-hidden";
  const buttonActiveClass = "bg-[var(--principal-green)] text-[var(--text-light)] shadow-lg shadow-[var(--principal-green)]/20";
  const buttonInactiveClass = "text-[var(--text-muted)] hover:bg-[var(--light-blue-1)] before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-[#ffffff10] before:via-[#ffffff05] before:to-transparent before:rounded-lg before:-z-10";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{dataType}</h2>
          <div className="flex gap-2 p-1 rounded-lg dark:bg-[var(--dark-blue-1)]/50 backdrop-blur-sm">
            {Object.keys(dataTypes).map((type) => (
              <button
                key={type}
                onClick={() => setDataType(type as keyof typeof dataTypes)}
                className={`${buttonBaseClass} ${
                  dataType === type ? buttonActiveClass : buttonInactiveClass
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 p-1 rounded-lg dark:bg-[var(--dark-blue-1)]/50 backdrop-blur-sm">
          {[
            { label: 'Last 3 months', value: '3m' },
            { label: 'Last 30 days', value: '30d' },
            { label: 'Last 7 days', value: '7d' },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`${buttonBaseClass} ${
                timeRange === range.value ? buttonActiveClass : buttonInactiveClass
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-[#ffffff10] before:via-[#ffffff05] before:to-transparent before:rounded-lg before:-z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filterData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`${dataType}Gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={dataTypes[dataType].color} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={dataTypes[dataType].color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="var(--light-blue-1)" 
            />
            <XAxis 
              dataKey="date" 
              stroke="var(--text-light)" 
              fontSize={11}
              axisLine={{ stroke: 'var(--light-blue-1)' }}
              tickLine={false}
              dy={10}
              interval={4}
              tick={({ x, y, payload, index }) => (
                <g transform={`translate(${x},${y})`}>
                  <text
                    x={0}
                    y={0}
                    dy={16}
                    textAnchor="middle"
                    fill={payload.isPrimaryTick ? "var(--text-light)" : "var(--text-muted)"}
                    fontSize={payload.isPrimaryTick ? 11 : 10}
                  >
                    {payload.value}
                  </text>
                </g>
              )}
            />
            <YAxis 
              stroke="var(--text-light)" 
              fontSize={11}
              axisLine={{ stroke: 'var(--light-blue-1)' }}
              tickLine={false}
              dx={-10}
              unit={dataTypes[dataType].unit}
            />
            <Tooltip content={CustomTooltip} />
            <Line
              type="monotone"
              dataKey={dataType}
              stroke={dataTypes[dataType].color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: dataTypes[dataType].color }}
              fill={`url(#${dataType}Gradient)`}
            />
            <Line
              type="monotone"
              dataKey={`Previous ${dataType}`}
              stroke="var(--light-blue-2)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--light-blue-2)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

