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
        .limit(2);

      if (error) {
        console.error("Error fetching readings:", error.message);
        return;
      }

      if (!data || data.length < 2) {
        console.warn("Not enough data for trend calculation.");
        return;
      }

      const [latest, previous] = data;

      const getTrend = (current: number | null, prev: number | null) => {
        if (current != null && prev != null && prev !== 0) {
          const diff = ((current - prev) / prev) * 100;
          const trend = diff.toFixed(1) + "%";
          return {
            trend,
            trendIcon: diff > 0 ? "up" : diff < 0 ? "down" : "neutral"
          };
        }
        return { trend: "0%", trendIcon: "neutral" };
      };

      const temperature = latest?.IndoorTemperature ?? 25.5;
      const humidity = latest?.Humidity ?? 25.5;
      const co2 = latest?.CO2Level ?? 1000;
      const light = latest?.LightLevel ?? 1000;

      const cards = [
        {
          name: "Temperature",
          value: `${temperature}°`,
          ...getTrend(
            temperature,
            typeof previous?.IndoorTemperature === "number" ? previous.IndoorTemperature : null
          ),
          eval: "bad",
          description: "Temperature is going up",
          footer: "Care is needed"
        },
        {
          name: "Humidity",
          value: `${humidity}%`,
          ...getTrend(
            humidity,
            typeof previous?.Humidity === "number" ? previous.Humidity : null
          ),
          eval: "good",
          description: "Humidity is going down",
          footer: "In a normal range"
        },
        {
          name: "CO2 Level",
          value: `${co2} ppm`,
          ...getTrend(
            co2,
            typeof previous?.CO2Level === "number" ? previous.CO2Level : null
          ),
          eval: "neutral",
          description: "CO2 level is going up",
          footer: "Care is needed"
        },
        {
          name: "Light",
          value: `${light} lux`,
          ...getTrend(
            light,
            typeof previous?.LightLevel === "number" ? previous.LightLevel : null
          ),
          eval: "bad",
          description: "Light is going down",
          footer: "In a normal range"
        }
      ];

      setCardData(cards);
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
