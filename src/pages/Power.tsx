'use client';

import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, Sector, PolarRadiusAxis } from 'recharts';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconBolt, IconChartBar, IconChartPie, IconChartLine, IconChartRadar, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

// Generate 90 days of hourly data (2160 data points)
const generateHistoricalData = () => {
    const data: Array<{
        time: string;
        date: string;
        Consumption: number;
        Baseline: number;
    }> = [];
    for (let day = 0; day < 90; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const date = new Date();
            date.setDate(date.getDate() - day);
            date.setHours(hour);
            
            let baseConsumption;
            // Business days have higher consumption
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            if (hour >= 9 && hour <= 17) {
                baseConsumption = isWeekend ? 300 + Math.random() * 150 : 400 + Math.random() * 200;
            } else if (hour >= 18 && hour <= 22) {
                baseConsumption = isWeekend ? 200 + Math.random() * 100 : 300 + Math.random() * 150;
            } else {
                baseConsumption = 150 + Math.random() * 100;
            }

            // Add seasonal variation
            const month = date.getMonth();
            if (month >= 5 && month <= 7) { // Summer
                baseConsumption *= 1.3;
            } else if (month >= 11 || month <= 1) { // Winter
                baseConsumption *= 1.2;
            }

            data.push({
                time: `${String(hour).padStart(2, '0')}:00`,
                date: date.toISOString().split('T')[0],
                Consumption: Math.floor(baseConsumption),
                Baseline: hour >= 9 && hour <= 17 ? 450 : hour >= 18 && hour <= 22 ? 350 : 200
            });
        }
    }
    return data;
};

const energyConsumptionData = generateHistoricalData();

// Generate 13 weeks of data
const generateWeeklyData = () => {
    const data: Array<{
        day: string;
        week: number;
        Consumption: number;
        Average: number;
        date: string;
    }> = [];
    for (let week = 12; week >= 0; week--) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        days.forEach((day, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (week * 7 + (6 - i)));
            
            let baseConsumption;
            if (i < 5) { // Weekdays
                baseConsumption = 800 + Math.random() * 400;
            } else { // Weekends
                baseConsumption = 400 + Math.random() * 200;
            }

            // Add seasonal variation
            const month = date.getMonth();
            if (month >= 5 && month <= 7) { // Summer
                baseConsumption *= 1.3;
            } else if (month >= 11 || month <= 1) { // Winter
                baseConsumption *= 1.2;
            }

            data.push({
                day: `${day} W${12-week}`,
                week: 12-week,
                Consumption: Math.floor(baseConsumption),
                Average: 750,
                date: date.toISOString().split('T')[0]
            });
        });
    }
    return data;
};

const weeklyData = generateWeeklyData();

const sourcesData = [
    { name: 'Lighting', value: 55 },
    { name: 'HVAC', value: 35 },
    { name: 'Security', value: 15 },
    { name: 'Equipment', value: 25 },
    { name: 'Other', value: 10 }
];

const efficiencyData = [
    { subject: 'Peak Load', A: 85 },
    { subject: 'Base Load', A: 65 },
    { subject: 'Efficiency', A: 78 },
    { subject: 'Distribution', A: 90 },
    { subject: 'Utilization', A: 72 },
];

const yearlyData = Array.from({ length: 12 }, (_, i) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
        month: months[i],
        Consumption: Math.floor(1000 + Math.random() * 500)
    };
});

// Updated color scheme to match the image
const COLORS = [
    'rgb(47, 185, 108)',     // Main green
    'rgb(47, 185, 108, 0.8)',
    'rgb(47, 185, 108, 0.6)',
    'rgb(47, 185, 108, 0.4)',
    'rgb(47, 185, 108, 0.3)'
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#020818] border border-[#172d662c] shadow-xl px-3 py-2 rounded-lg">
                <p className="text-[#f9f9f9] text-sm font-medium mb-1">{payload[0].name}</p>
                <p className="text-[#2fb96c] text-sm font-bold">{payload[0].value} kWh</p>
            </div>
        );
    }
    return null;
};

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke="none"
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 10}
                outerRadius={outerRadius + 15}
                fill={fill}
                stroke="none"
            />
        </g>
    );
};

// Add prediction data generation
const generatePredictionData = () => {
    const data: Array<{
        hour: string;
        Prediction: number;
        Historical: number;
    }> = [];
    const currentHour = new Date().getHours();
    
    for (let i = 0; i < 24; i++) {
        const hour = (currentHour + i) % 24;
        const isPeakHour = hour >= 9 && hour <= 17;
        const isEveningHour = hour >= 18 && hour <= 22;
        
        let basePrediction;
        if (isPeakHour) {
            basePrediction = 400 + Math.random() * 200;
        } else if (isEveningHour) {
            basePrediction = 300 + Math.random() * 150;
        } else {
            basePrediction = 150 + Math.random() * 100;
        }

        data.push({
            hour: `${String(hour).padStart(2, '0')}:00`,
            Prediction: Math.floor(basePrediction),
            Historical: Math.floor(basePrediction * 0.9 + Math.random() * 50)
        });
    }
    return data;
};

const predictionData = generatePredictionData();

export default function Power() {
    const [activeSource, setActiveSource] = useState(sourcesData[0].name);
    const activeIndex = useMemo(
        () => sourcesData.findIndex((item) => item.name === activeSource),
        [activeSource]
    );
    
    const currentMonthEstimate = 1250; // kWh
    const lastMonthConsumption = 1180; // kWh
    const percentageChange = ((currentMonthEstimate - lastMonthConsumption) / lastMonthConsumption * 100).toFixed(1);
    const totalConsumption = sourcesData.reduce((acc, curr) => acc + curr.value, 0);

    const cardStyle = "p-3 bg-[#020818] border-0 shadow-lg relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-[#ffffff10] before:via-[#ffffff05] before:to-transparent before:rounded-lg before:-z-10 before:pointer-events-none backdrop-blur-sm";

    // Group data by date for the line chart
    const dailyData = useMemo(() => {
        const grouped = energyConsumptionData.reduce((acc, curr) => {
            const date = curr.date;
            if (!acc[date]) {
                acc[date] = {
                    date,
                    Consumption: curr.Consumption,
                    count: 1,
                    Baseline: curr.Baseline
                };
            } else {
                acc[date].Consumption += curr.Consumption;
                acc[date].Baseline += curr.Baseline;
                acc[date].count += 1;
            }
            return acc;
        }, {} as Record<string, any>);

        return Object.values(grouped).map(day => ({
            date: day.date,
            Consumption: Math.round(day.Consumption / day.count),
            Baseline: Math.round(day.Baseline / day.count)
        }));
    }, [energyConsumptionData]);

    return (
        <div className="flex flex-1 flex-col p-4 gap-4">
            {/* Top Section - Current Power Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`${cardStyle} bg-gradient-to-br from-[#2fb96c20] to-[#02081800]`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider">Current Power Status</h2>
                            <div className="mt-4 flex items-center gap-4">
                                <IconBolt size={24} className="text-[#2fb96c]" />
                                <div>
                                    <span className="text-4xl font-bold dark:text-[#f9f9f9]">{currentMonthEstimate}</span>
                                    <span className="text-[#b3b3b3] ml-2">kWh</span>
                                </div>
                            </div>
                            <p className="text-[#b3b3b3] mt-2">
                                {Number(percentageChange) > 0 ? 'Higher' : 'Lower'} than last month by {Math.abs(Number(percentageChange))}%
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className={cardStyle}>
                    <h2 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider">Power Distribution</h2>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="flex flex-col items-center p-2 rounded-lg bg-[#172d662c]">
                            <IconChartPie size={20} className="text-[#2fb96c]" />
                            <span className="text-[#b3b3b3] text-xs mt-1">Total</span>
                            <span className="text-[#f9f9f9] font-bold">{totalConsumption}kWh</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-[#172d662c]">
                            <IconTrendingUp size={20} className="text-[#2fb96c]" />
                            <span className="text-[#b3b3b3] text-xs mt-1">Peak</span>
                            <span className="text-[#f9f9f9] font-bold">1.2kW</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-[#172d662c]">
                            <IconTrendingDown size={20} className="text-[#2fb96c]" />
                            <span className="text-[#b3b3b3] text-xs mt-1">Base</span>
                            <span className="text-[#f9f9f9] font-bold">0.8kW</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Power Consumption Chart */}
            <Card className={cardStyle}>
                <h2 className="text-xs font-medium px-1 text-[#b3b3b3] uppercase tracking-wider">Power Consumption</h2>
                <div className="h-[260px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#172d662c" />
                            <XAxis
                                dataKey="date"
                                stroke="var(--text-light)"
                                fontSize={11}
                                axisLine={{ stroke: 'var(--light-blue-1)' }}
                                tickLine={false}
                                tick={{ fill: 'var(--foreground, #000000)', className: 'dark:fill-[var(--text-light)]' }}
                            />
                            <YAxis
                                stroke="var(--text-light)"
                                fontSize={11}
                                axisLine={{ stroke: 'var(--light-blue-1)' }}
                                tickLine={false}
                                tick={{ fill: 'var(--foreground, #000000)', className: 'dark:fill-[var(--text-light)]' }}
                                unit="kWh"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" />
                            <Line
                                type="monotone"
                                dataKey="Consumption"
                                stroke="#2fb96c"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: '#2fb96c', stroke: '#f9f9f9' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Baseline"
                                stroke="#465fa44d"
                                strokeDasharray="5 5"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Bottom Section - Now in 2 rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Power Sources */}
                <Card className={cardStyle}>
                    <h2 className="text-xs font-medium px-1 text-[#b3b3b3] uppercase tracking-wider">Power Sources</h2>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sourcesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                >
                                    {sourcesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Efficiency Metrics */}
                <Card className={cardStyle}>
                    <h2 className="text-xs font-medium px-1 text-[#b3b3b3] uppercase tracking-wider">Efficiency Metrics</h2>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={efficiencyData}>
                                <PolarGrid 
                                    gridType="circle"
                                    radialLines={false}
                                    stroke="#172d662c"
                                />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    stroke="#f9f9f9"
                                    fontSize={11}
                                    tick={{ fill: '#f9f9f9' }}
                                />
                                <Radar
                                    name="Efficiency"
                                    dataKey="A"
                                    stroke="#2fb96c"
                                    fill="#2fb96c"
                                    fillOpacity={0.3}
                                    dot={{
                                        r: 4,
                                        fillOpacity: 1,
                                        fill: "#2fb96c"
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Weekly Overview */}
                <Card className={cardStyle}>
                    <h2 className="text-xs font-medium px-1 text-[#b3b3b3] uppercase tracking-wider">Weekly Overview</h2>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#172d662c" />
                                <XAxis
                                    dataKey="day"
                                    stroke="#f9f9f9"
                                    fontSize={11}
                                    axisLine={{ stroke: '#f9f9f940' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#f9f9f9"
                                    fontSize={11}
                                    axisLine={{ stroke: '#f9f9f940' }}
                                    tickLine={false}
                                    unit="kWh"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="Consumption"
                                    fill="#2fb96c"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Yearly Trend */}
                <Card className={cardStyle}>
                    <h2 className="text-xs font-medium px-1 dark:text-[#b3b3b3] uppercase tracking-wider">Yearly Trend</h2>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yearlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#172d662c" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#f9f9f9"
                                    fontSize={11}
                                    axisLine={{ stroke: '#f9f9f940' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#f9f9f9"
                                    fontSize={11}
                                    axisLine={{ stroke: '#f9f9f940' }}
                                    tickLine={false}
                                    unit="kWh"
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="Consumption"
                                    stroke="#2fb96c"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Prediction Chart */}
            <Card className={cardStyle}>
                <h2 className="text-xs font-medium px-1 text-[#b3b3b3] uppercase tracking-wider">Power Consumption Prediction</h2>
                <div className="h-[260px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={predictionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#172d662c" />
                            <XAxis
                                dataKey="hour"
                                stroke="var(--text-light)"
                                fontSize={11}
                                axisLine={{ stroke: 'var(--light-blue-1)' }}
                                tickLine={false}
                                tick={{ fill: 'var(--foreground, #000000)', className: 'dark:fill-[var(--text-light)]' }}
                            />
                            <YAxis
                                stroke="var(--text-light)"
                                fontSize={11}
                                axisLine={{ stroke: 'var(--light-blue-1)' }}
                                tickLine={false}
                                tick={{ fill: 'var(--foreground, #000000)', className: 'dark:fill-[var(--text-light)]' }}
                                unit="kWh"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" />
                            <Line
                                type="monotone"
                                dataKey="Prediction"
                                stroke="#2fb96c"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: '#2fb96c', stroke: '#f9f9f9' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Historical"
                                stroke="#465fa44d"
                                strokeDasharray="5 5"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex w-full items-start gap-2 text-sm mt-4">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none dark:text-[#f9f9f9]">
                            Trending up by 5.2% this hour <IconTrendingUp className="h-4 w-4 text-[#2fb96c]" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-[#b3b3b3]">
                            Showing predicted vs historical consumption for the next 24 hours
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
