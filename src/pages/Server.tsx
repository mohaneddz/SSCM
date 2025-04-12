"use client";

import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Server as ServerIcon, Cpu, Thermometer, Zap } from 'lucide-react';

// Define CSS variables for styling, including color schemes for both light and dark modes
const cardStyle = "p-3 border-0 shadow-lg relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-[var(--card-gradient-from)] before:via-[var(--card-gradient-via)] before:to-[var(--card-gradient-to)] before:rounded-lg before:-z-10 before:pointer-events-none backdrop-blur-sm";

// Define chart theme colors
const chartTheme = {
  axisColor: "var(--axis-color)",
  textColor: "var(--text-color)",
  gridColor: "#172d662c",
};

// Type definitions
interface RequestData {
  date: string;
  requests: number;
  errors: number;
}

interface TemperatureData {
  hour: string;
  cpu: number;
  gpu: number;
  ambient: number;
}

interface WeeklyData {
  day: string;
  requests: number;
  power: number;
  temperature: number;
}

interface PerformanceData {
  metric: string;
  value: number;
}

interface ResourceData {
  resource: string;
  usage: number;
  fill: string;
}

// Generate server request data
const generateRequestData = (): RequestData[] => {
  const data: RequestData[] = [];
  for (let i = 0; i < 90; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      requests: Math.floor(1000 + Math.random() * 2000),
      errors: Math.floor(10 + Math.random() * 50)
    });
  }
  return data;
};

// Generate server temperature data
const generateTemperatureData = (): TemperatureData[] => {
  const data: TemperatureData[] = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      hour: `${i}:00`,
      cpu: 45 + Math.random() * 20,
      gpu: 50 + Math.random() * 25,
      ambient: 22 + Math.random() * 5
    });
  }
  return data;
};

// Generate weekly comparison data
const generateWeeklyData = (): WeeklyData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    requests: Math.floor(5000 + Math.random() * 5000),
    power: Math.floor(1000 + Math.random() * 1000),
    temperature: Math.floor(40 + Math.random() * 20)
  }));
};

// Generate server performance data for radar chart
const generatePerformanceData = (): PerformanceData[] => {
  return [
    { metric: 'CPU Usage', value: 75 },
    { metric: 'Memory', value: 60 },
    { metric: 'Storage', value: 45 },
    { metric: 'Network', value: 80 },
    { metric: 'I/O', value: 65 },
    { metric: 'Cache', value: 70 }
  ];
};

// Generate server resource distribution data
const generateResourceData = (): ResourceData[] => {
  return [
    { resource: 'CPU', usage: 75, fill: 'rgb(47, 185, 108)' },
    { resource: 'Memory', usage: 60, fill: 'rgba(47, 185, 108, 0.8)' },
    { resource: 'Storage', usage: 45, fill: 'rgba(47, 185, 108, 0.6)' },
    { resource: 'Network', usage: 80, fill: 'rgba(47, 185, 108, 0.4)' },
    { resource: 'Cache', usage: 70, fill: 'rgba(47, 185, 108, 0.3)' }
  ];
};

// Add new data generation functions
const generateCPULoadData = (): Array<{ time: string; load: number; threads: number }> => {
  const data: Array<{ time: string; load: number; threads: number }> = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${String(i).padStart(2, '0')}:00`,
      load: 45 + Math.random() * 40,
      threads: Math.floor(8 + Math.random() * 16)
    });
  }
  return data;
};

const generateMemoryData = (): Array<{ time: string; used: number; cached: number; available: number }> => {
  const data: Array<{ time: string; used: number; cached: number; available: number }> = [];
  for (let i = 0; i < 24; i++) {
    const total = 32; // 32GB total memory
    const used = 10 + Math.random() * 15;
    const cached = 2 + Math.random() * 4;
    const available = total - used - cached;
    data.push({
      time: `${String(i).padStart(2, '0')}:00`,
      used,
      cached,
      available
    });
  }
  return data;
};

const generateNetworkData = (): Array<{ time: string; incoming: number; outgoing: number }> => {
  const data: Array<{ time: string; incoming: number; outgoing: number }> = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${String(i).padStart(2, '0')}:00`,
      incoming: Math.floor(50 + Math.random() * 150),
      outgoing: Math.floor(30 + Math.random() * 100)
    });
  }
  return data;
};

const requestData = generateRequestData();
const temperatureData = generateTemperatureData();
const weeklyData = generateWeeklyData();
const performanceData = generatePerformanceData();
const resourceData = generateResourceData();
const cpuLoadData = generateCPULoadData();
const memoryData = generateMemoryData();
const networkData = generateNetworkData();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#020818] border border-[#172d662c] shadow-xl px-3 py-2 rounded-lg">
        <p className="text-[#f9f9f9] text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-[#2fb96c] text-sm font-bold">
            {entry.name}: {entry.value}
          </p>
        ))}
        </div>
    );
  }
  return null;
};

export default function Server() {
  const [activeMetric, setActiveMetric] = useState('requests');

  const totalRequests = useMemo(() => 
    requestData.reduce((acc, curr) => acc + curr.requests, 0), 
    [requestData]
  );

  const totalErrors = useMemo(() => 
    requestData.reduce((acc, curr) => acc + curr.errors, 0), 
    [requestData]
  );

  return (
    <div className="flex flex-1 flex-col p-4 gap-4"
         style={{
           '--card-gradient-from': '#ffffff10',
           '--card-gradient-via': '#ffffff05',
           '--card-gradient-to': 'transparent',
           '--card-bg-from': '#2fb96c20',
           
           '--card-bg-to': '#02081800',
           '--text-color': '#000000',
           '--axis-color': '#000000',
         } as React.CSSProperties}
         data-theme={typeof window !== 'undefined' && window.document.documentElement.classList.contains('dark') ? 'dark' : 'light'}>
      <style jsx global>{`
        .dark [data-theme="light"],
        [data-theme="dark"] {
          --text-color: #f9f9f9;
          --axis-color: #f9f9f9;
        }
      `}</style>
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${cardStyle} bg-gradient-to-br from-[var(--card-bg-from)] to-[var(--card-bg-to)]`}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ServerIcon className="text-[#2fb96c]" />
              <h3 className="text-xs font-medium text-slate-700 dark:text-[#b3b3b3] uppercase tracking-wider">Total Requests</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold dark:text-[#f9f9f9]">{totalRequests.toLocaleString()}</span>
              <span className="text-sm font-medium text-[#2fb96c]">
                <TrendingUp className="inline-block mr-1" />
                +12.5%
              </span>
            </div>
            <p className="text-[#b3b3b3] text-sm">Last 90 days</p>
          </div>
        </Card>

        <Card className={cardStyle}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="text-[#2fb96c]" />
              <h3 className="text-xs font-medium text-slate-700  dark:text-[#b3b3b3] uppercase tracking-wider">CPU Usage</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold dark:text-[#f9f9f9]">75%</span>
              <span className="text-sm font-medium text-[#972b2b]">
                <TrendingUp className="inline-block mr-1" />
                +5.2%
              </span>
            </div>
            <p className="text-[#b3b3b3] text-sm">Current load</p>
          </div>
        </Card>

        <Card className={cardStyle}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Thermometer className="text-[#2fb96c]" />
              <h3 className="text-xs font-medium text-slate-700  dark:text-[#b3b3b3] uppercase tracking-wider">Temperature</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold dark:text-[#f9f9f9]">45°C</span>
              <span className="text-sm font-medium text-[#2fb96c]">
                <TrendingDown className="inline-block mr-1" />
                -2.1%
              </span>
            </div>
            <p className="text-[#b3b3b3] text-sm">CPU temperature</p>
          </div>
        </Card>

        <Card className={cardStyle}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Zap className="text-[#2fb96c]" />
              <h3 className="text-xs font-medium text-slate-700 dark:text-[#b3b3b3] uppercase tracking-wider">Power Draw</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold dark:text-[#f9f9f9]">1.2kW</span>
              <span className="text-sm font-medium text-[#2fb96c]">
                <TrendingDown className="inline-block mr-1" />
                -3.5%
              </span>
            </div>
            <p className="text-[#b3b3b3] text-sm">Current consumption</p>
          </div>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 gap-4">
        {/* First Row - Three Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Performance Metrics */}
          <Card className={cardStyle}>
            <h3 className="text-xs font-medium text-slate-700 dark:text-[#b3b3b3] uppercase tracking-wider mb-4">Performance Metrics</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performanceData}>
                  <PolarGrid stroke={chartTheme.gridColor} />
                  <PolarAngleAxis dataKey="metric" stroke={chartTheme.axisColor} />
                  <Radar name="Performance" dataKey="value" stroke="#2fb96c" fill="#2fb96c" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Weekly Comparison */}
          <Card className={cardStyle}>
            <h3 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider mb-4">Weekly Comparison</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                  <XAxis dataKey="day" stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} />
                  <YAxis stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="requests" fill="#2fb96c" name="Requests" />
                  <Bar dataKey="power" fill="#465fa4" name="Power" />
                  <Bar dataKey="temperature" fill="#972b2b" name="Temperature" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Resource Distribution */}
          <Card className={cardStyle}>
            <div className="flex flex-col items-center">
              <h3 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider mb-4">Resource Distribution</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart data={resourceData} innerRadius="30%" outerRadius="100%" barSize={10} startAngle={0} endAngle={360}>
                    <PolarGrid gridType="circle" />
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background dataKey="usage" cornerRadius={0} fill="#2fb96c" />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="dark:text-[#f9f9f9] text-lg font-bold">
                      {Math.round(resourceData.reduce((acc, curr) => acc + curr.usage, 0) / resourceData.length)}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 text-sm mt-4">
                <div className="flex items-center gap-2 font-medium leading-none dark:text-[#f9f9f9]">
                  <TrendingUp className="h-4 w-4 text-[#2fb96c]" />
                  Trending up by 5.2% this month
                </div>
                <div className="text-[#b3b3b3] text-sm">
                  Showing resource utilization for the last 6 months
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Second Row - Single Column */}
        <Card className={cardStyle}>
          <h3 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider mb-4">Temperature Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                <XAxis dataKey="hour" stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} />
                <YAxis stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} unit="°C" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="cpu" stroke="#2fb96c" name="CPU" />
                <Line type="monotone" dataKey="gpu" stroke="#465fa4" name="GPU" />
                <Line type="monotone" dataKey="ambient" stroke="#972b2b" name="Ambient" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Third Row - Three Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Memory Usage */}
          <Card className={cardStyle}>
            <h3 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider mb-4">Memory Usage</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                  <XAxis dataKey="time" stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} />
                  <YAxis stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} unit="GB" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="used" stackId="a" fill="#2fb96c" name="Used" />
                  <Bar dataKey="cached" stackId="a" fill="#465fa4" name="Cached" />
                  <Bar dataKey="available" stackId="a" fill="#172d662c" name="Available" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Network Traffic */}
          <Card className={cardStyle}>
            <h3 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider mb-4">Network Traffic</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={networkData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                  <XAxis dataKey="time" stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} />
                  <YAxis stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} unit="Mbps" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="incoming" stroke="#2fb96c" name="Incoming" />
                  <Line type="monotone" dataKey="outgoing" stroke="#465fa4" name="Outgoing" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Disk I/O */}
          <Card className={cardStyle}>
            <h3 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider mb-4">Disk I/O</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={networkData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                  <XAxis dataKey="time" stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} />
                  <YAxis stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} unit="MB/s" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="incoming" stroke="#2fb96c" name="Read" />
                  <Line type="monotone" dataKey="outgoing" stroke="#465fa4" name="Write" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Fourth Row - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Server Response Time */}
          <Card className={cardStyle}>
            <h3 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider mb-4">Server Response Time</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={networkData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                  <XAxis dataKey="time" stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} />
                  <YAxis stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} unit="ms" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="incoming" stroke="#2fb96c" name="Average" />
                  <Line type="monotone" dataKey="outgoing" stroke="#972b2b" name="Peak" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Request History */}
          <Card className={cardStyle}>
            <h3 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider mb-4">Request History</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                  <XAxis dataKey="date" stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} />
                  <YAxis stroke={chartTheme.axisColor} fontSize={11} axisLine={{ stroke: '#f9f9f940' }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="requests" fill="#2fb96c" name="Requests" />
                  <Bar dataKey="errors" fill="#972b2b" name="Errors" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
