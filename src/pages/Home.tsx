"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import SectionCards from "@/components/section-cards";
import SectionCharts from "@/components/section-charts";
import SectionMiniCards from "@/components/section-mini-cards";
import SectionPredictionChart from "@/components/section-prediction-chart";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';

const supabase = createClient();

const cardStyle = "p-3 bg-[#020818] border-0 shadow-lg relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-[#ffffff10] before:via-[#ffffff05] before:to-transparent before:rounded-lg before:-z-10 before:pointer-events-none backdrop-blur-sm";

interface CardData {
  name: string;
  value: string;
  trend: string;
  trendIcon: 'up' | 'down';
  eval: 'good' | 'bad' | 'neutral';
  description: string;
  footer: string;
}

export default function Home() {
  const [cardData, setCardData] = useState<CardData[]>([]);

  useEffect(() => {
    const fetchLatestReadings = async () => {
      const { data, error } = await supabase
        .from("CurrentReadings")
        .select("*")
        .eq("device_id", "1399e453-7ed3-4189-88e1-77a465056a45")
        .order("Timestamp", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching readings:", error.message);
        return;
      }

      const reading = data?.[0] ?? {};
      const prevReading = {
        IndoorTemperature: 25.5,
        Humidity: 45,
        CO2Level: 800,
        LightLevel: 500
      };

      // Calculate trends
      const calculateTrend = (current: number, previous: number) => {
        const diff = ((current - previous) / previous) * 100;
        return {
          trend: `${Math.abs(diff).toFixed(1)}%`,
          trendIcon: diff >= 0 ? 'up' as const : 'down' as const
        };
      };

      // Evaluate status
      const evaluateStatus = (name: string, value: number) => {
        switch (name) {
          case 'Temperature':
            return value > 26 ? 'bad' : value < 20 ? 'bad' : 'good';
          case 'Humidity':
            return value > 60 ? 'bad' : value < 30 ? 'bad' : 'good';
          case 'CO2 Level':
            return value > 1000 ? 'bad' : value < 400 ? 'neutral' : 'good';
          case 'Light':
            return value > 1500 ? 'bad' : value < 300 ? 'bad' : 'good';
          default:
            return 'neutral';
        }
      };

      const updatedCards: CardData[] = [
        {
          name: "Temperature",
          value: `${reading.IndoorTemperature?.toFixed(1) ?? prevReading.IndoorTemperature}°C`,
          ...calculateTrend(reading.IndoorTemperature ?? prevReading.IndoorTemperature, prevReading.IndoorTemperature),
          eval: evaluateStatus('Temperature', reading.IndoorTemperature ?? prevReading.IndoorTemperature) as 'good' | 'bad' | 'neutral',
          description: `Indoor temperature is ${reading.IndoorTemperature > prevReading.IndoorTemperature ? 'rising' : 'falling'}`,
          footer: "Updated just now"
        },
        {
          name: "Humidity",
          value: `${reading.Humidity?.toFixed(1) ?? prevReading.Humidity}%`,
          ...calculateTrend(reading.Humidity ?? prevReading.Humidity, prevReading.Humidity),
          eval: evaluateStatus('Humidity', reading.Humidity ?? prevReading.Humidity) as 'good' | 'bad' | 'neutral',
          description: `Relative humidity is ${reading.Humidity > prevReading.Humidity ? 'increasing' : 'decreasing'}`,
          footer: "Updated just now"
        },
        {
          name: "CO2 Level",
          value: `${reading.CO2Level ?? prevReading.CO2Level} ppm`,
          ...calculateTrend(reading.CO2Level ?? prevReading.CO2Level, prevReading.CO2Level),
          eval: evaluateStatus('CO2 Level', reading.CO2Level ?? prevReading.CO2Level) as 'good' | 'bad' | 'neutral',
          description: `CO2 concentration is ${reading.CO2Level > prevReading.CO2Level ? 'rising' : 'falling'}`,
          footer: "Updated just now"
        },
        {
          name: "Light",
          value: `${reading.LightLevel ?? prevReading.LightLevel} lux`,
          ...calculateTrend(reading.LightLevel ?? prevReading.LightLevel, prevReading.LightLevel),
          eval: evaluateStatus('Light', reading.LightLevel ?? prevReading.LightLevel) as 'good' | 'bad' | 'neutral',
          description: `Light level is ${reading.LightLevel > prevReading.LightLevel ? 'increasing' : 'decreasing'}`,
          footer: "Updated just now"
        }
      ];

      setCardData(updatedCards);
    };

    fetchLatestReadings();
    
    // Fetch new readings every minute
    const interval = setInterval(fetchLatestReadings, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 p-4">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardData.map((item, index) => (
            <Card
              key={index}
              className={`${cardStyle} ${index === 0
                ? 'bg-gradient-to-br from-[#2fb96c20] to-[#02081800]'
                : 'hover:bg-[#172d6640] transition-all duration-300'
              }`}
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold dark:text-[#f9f9f9]">{item.value}</span>
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    item.eval === 'good' 
                      ? 'text-[#2fb96c]' 
                      : item.eval === 'neutral'
                        ? 'text-[#465fa4]'
                        : 'text-[#972b2b]'
                  }`}>
                    {item.trendIcon === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {item.trend}
                  </span>
                </div>
                <p className="text-[#b3b3b3] text-sm">{item.description}</p>
                <div className="mt-2 text-xs font-medium text-[#b3b3b3]">{item.footer}</div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Charts Section */}
          <Card className={cardStyle}>
            <SectionCharts />
          </Card>
        </div>

        {/* Mini Cards Section */}
        <Card className={`${cardStyle} bg-gradient-to-br from-[#172d662c] to-[#02081800]`}>
          <SectionMiniCards />
        </Card>

        {/* Prediction Chart */}
        <SectionPredictionChart />
      </div>
    </div>
  );
}
