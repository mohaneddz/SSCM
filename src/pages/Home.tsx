<<<<<<< HEAD
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import SectionCards from "@/components/section-cards";
import SectionCharts from "@/components/section-charts";
import SectionMiniCards from "@/components/section-mini-cards";

const supabase = createClient();
=======
'use client';

import SectionCards from "@/components/section-cards"
import SectionCharts from "@/components/section-charts"
import SectionMiniCards from "@/components/section-mini-cards"
import { Card } from "@/components/ui/card"

const data = [
  {
    "name": "Temperature",
    "value": "25.5°",
    "trend": "+12.5%",
    "trendIcon": "up",
    "eval": "bad",
    "description": "Temperature is going up",
    "footer": "Care is needed"
  },
  {
    "name": "Humidity",
    "value": "25.5%",
    "trend": "-5%",
    "trendIcon": "down",
    "eval": "good",
    "description": "Humidity is going down",
    "footer": "In a normal range"
  },
  {
    "name": "CO2 Level",
    "value": "1000 ppm",
    "trend": "+5%",
    "trendIcon": "up",
    "eval": "neutral",
    "description": "CO2 level is going up",
    "footer": "Care is needed"
  },
  {
    "name": "Light",
    "value": "1000 lux",
    "trend": "-5%",
    "trendIcon": "down",
    "eval": "bad",
    "description": "Light is going down",
    "footer": "In a normal range"
  }
]
>>>>>>> 1a6c7cbef939d8cb4bc852f278cbae6cc8170fea

const cardStyle = "p-3 bg-[#020818] border-0 shadow-lg relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-[#ffffff10] before:via-[#ffffff05] before:to-transparent before:rounded-lg before:-z-10 before:pointer-events-none backdrop-blur-sm";

export default function Home() {
  const [cardData, setCardData] = useState<any[]>([]);

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

      const updatedCards = [
        {
          name: "Temperature",
          value: reading.IndoorTemperature != null ? `${reading.IndoorTemperature}°` : "25.5°",
          trend: "+12.5%",
          trendIcon: "up",
          eval: "bad",
          description: "Temperature is going up",
          footer: "Care is needed"
        },
        {
          name: "Humidity",
          value: reading.Humidity != null ? `${reading.Humidity}%` : "25.5%",
          trend: "-5%",
          trendIcon: "down",
          eval: "good",
          description: "Humidity is going down",
          footer: "In a normal range"
        },
        {
          name: "CO2 Level",
          value: reading.CO2Level != null ? `${reading.CO2Level} ppm` : "1000 ppm",
          trend: "+5%",
          trendIcon: "up",
          eval: "neutral",
          description: "CO2 level is going up",
          footer: "Care is needed"
        },
        {
          name: "Light",
          value: reading.LightLevel != null ? `${reading.LightLevel} lux` : "1000 lux",
          trend: "-5%",
          trendIcon: "down",
          eval: "bad",
          description: "Light is going down",
          footer: "In a normal range"
        }
      ];

      setCardData(updatedCards);
    };

    fetchLatestReadings();
  }, []);

  return (
    <div className="flex flex-1 flex-col">
<<<<<<< HEAD
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards data={cardData} />

          <div className="px-4 lg:px-6">
            <SectionCharts />
=======
      <div className="@container/main flex flex-1 flex-col gap-4 p-4">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.map((item, index) => (
            <Card 
              key={index} 
              className={`${cardStyle} ${
                index === 0 
                  ? 'bg-gradient-to-br from-[#2fb96c20] to-[#02081800]' 
                  : 'hover:bg-[#172d6640] transition-all duration-300'
              }`}
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#f9f9f9]">{item.value}</span>
                  <span className={`text-sm font-medium ${
                    item.trendIcon === 'up' 
                      ? 'text-[#972b2b]' 
                      : 'text-[#598d59]'
                  }`}>
                    {item.trend}
                  </span>
                </div>
                <p className="text-[#b3b3b3] text-sm">{item.description}</p>
                <div className="mt-2 text-xs font-medium text-[#b3b3b3]">{item.footer}</div>
              </div>
            </Card>
          ))}
        </div>

        <div className="px-0">
          {/* Charts Section */}
          <Card className={`${cardStyle} mb-4`}>
            <SectionCharts />
          </Card>

          {/* Mini Cards Section */}
          <Card className={`${cardStyle} bg-gradient-to-br from-[#172d662c] to-[#02081800]`}>
>>>>>>> 1a6c7cbef939d8cb4bc852f278cbae6cc8170fea
            <SectionMiniCards />
          </Card>
        </div>
      </div>
    </div>
  );
}
