"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import SectionCards from "@/components/section-cards";
import SectionCharts from "@/components/section-charts";
import SectionMiniCards from "@/components/section-mini-cards";

const supabase = createClient();

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
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards data={cardData} />

          <div className="px-4 lg:px-6">
            <SectionCharts />
            <SectionMiniCards />
          </div>
        </div>
      </div>
    </div>
  );
}
