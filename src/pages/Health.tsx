"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import ComponentCard from "@/components/component-card";
import { Input } from "@/components/ui/input";

const supabase = createClient();

export default function Health() {
  const [search, setSearch] = useState<string>("");
  const [deviceData, setDeviceData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to resolve local image path based on device name
  const resolveImage = (deviceName: string) => {
    switch ((deviceName ?? "").toLowerCase()) {
      case "rfid":
        return "/components/RFID.png";
      case "relay":
        return "/components/raly.png";
      case "servo motor":
        return "/components/servo_motor.png";
      case "motion sensor":
        return "/components/motion_sensor.png";
      case "dht11":
        return "/components/DHT11.png";
      case "camera":
        return "/components/Camera.png";
      case "microcontroller":
        return "/components/Microcontroller.png";
      case "ventilation":
        return "/components/Ventilation.png";
      default:
        return "/components/fallback.png"; // fallback image
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await supabase.from("Device").select("*");

      if (error) {
        console.error("Error fetching devices:", error.message);
        setLoading(false);
        return;
      }

      const enrichedData = (data || []).map((item) => {
        const image = resolveImage(item.device_name);
        return { ...item, image };
      });

      setDeviceData(enrichedData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredData = deviceData.filter((item) =>
    (item.device_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="justify-center items-center text-center text-white">
      <h1 className="my-8 text-xl font-black text-foreground dark:text-white">Items Health State</h1>

      <div className="flex justify-center items-center mb-4">
        <Input
          type="text"
          placeholder="Search..."
          className="w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center items-center mx-8">
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <ComponentCard
                key={index}
                title={item.device_name}
                image={item.image}
                model={item.model}
                health={item.health}
                estimateTime={item.estimateTime}
              />
            ))
          ) : (
            <p className="text-gray-400">No items match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
