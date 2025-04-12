"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const generatePredictionData = () => {
    const data: Array<{
        hour: string;
        Temperature: number;
        Humidity: number;
        CO2: number;
        Light: number;
    }> = [];
    const currentHour = new Date().getHours();
    
    for (let i = 0; i < 24; i++) {
        const hour = (currentHour + i) % 24;
        const isDaytime = hour >= 6 && hour <= 18;
        
        data.push({
            hour: `${String(hour).padStart(2, '0')}:00`,
            Temperature: Math.round(22 + Math.sin(i * 0.2) * 3 + Math.random() * 2),
            Humidity: Math.round(45 + Math.sin(i * 0.15) * 10 + Math.random() * 5),
            CO2: Math.round(400 + Math.sin(i * 0.1) * 100 + Math.random() * 50),
            Light: Math.round(isDaytime ? 800 + Math.sin(i * 0.2) * 200 + Math.random() * 100 : 50 + Math.random() * 50)
        });
    }
    return data;
};

const predictionData = generatePredictionData();

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#020818] border border-[#172d662c] shadow-xl px-3 py-2 rounded-lg">
                <p className="text-[#f9f9f9] text-sm font-medium mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}{entry.name === 'Temperature' ? '°C' : entry.name === 'Humidity' ? '%' : entry.name === 'CO2' ? 'ppm' : 'lux'}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function SectionPredictionChart() {
    return (
        <Card className="mt-4 p-3 bg-[#020818] border-0 shadow-lg relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-[#ffffff10] before:via-[#ffffff05] before:to-transparent before:rounded-lg before:-z-10 before:pointer-events-none backdrop-blur-sm">

            <CardHeader>
                <CardTitle className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider">Environmental Predictions</CardTitle>
                <CardDescription className="text-[#b3b3b3]">Next 24 hours forecast</CardDescription>
            </CardHeader>

            <CardContent>
                <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={predictionData}
                            margin={{
                                left: 12,
                                right: 12,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#172d662c" />
                            <XAxis
                                dataKey="hour"
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
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" />
                            <Line
                                type="monotone"
                                dataKey="Temperature"
                                stroke="#2fb96c"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: '#2fb96c', stroke: '#f9f9f9' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Humidity"
                                stroke="#465fa4"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: '#465fa4', stroke: '#f9f9f9' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="CO2"
                                stroke="#972b2b"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: '#972b2b', stroke: '#f9f9f9' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="Light"
                                stroke="#598d59"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: '#598d59', stroke: '#f9f9f9' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>

            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 font-medium leading-none text-[#f9f9f9]">
                            Trending up by 5.2% this hour <TrendingUp className="h-4 w-4 text-[#2fb96c]" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-[#b3b3b3]">
                            Showing predicted values for the next 24 hours
                        </div>
                    </div>
                </div>
            </CardFooter>

        </Card>
    );
} 