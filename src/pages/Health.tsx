import Image from "next/image";
import { useState } from "react";

import ComponentCard from "@/components/component-card";
import { Input } from "@/components/ui/input"

const img1 = "/components/ventilation.png";
const img2 = "/components/microcontroller.png";
const img3 = "/components/camera.png";
const img4 = "/components/DHT11.png";
const img5 = "/components/motion_sensor.png";
const img6 = "/components/servo_motor.png";
const img7 = "/components/raly.png";
const img8 = "/components/rfid.png";

const data = [
  {
    title: "Ventilation",
    image: img1,
    model: "MSYNCAQ948",
    health: 61,
    estimateTime: "16/4/2026",
  },
  {
    title: "Microcontroller",
    image: img2,
    model: "MSYNCAQ948",
    health: 61,
    estimateTime: "16/4/2026",
  },
  {
    title: "Microcontroller",
    image: img2,
    model: "MSYNCAQ948",
    health: 61,
    estimateTime: "16/4/2026",
  },
  {
    title: "Camera",
    image: img3,
    model: "MSYNCAQ948",
    health: 98,
    estimateTime: "16/4/2026",
  },
  {
    title: "DHT11",
    image: img4,
    model: "MSYNCAQ948",
    health: 98,
    estimateTime: "16/4/2026",
  },
  {
    title: "DHT11",
    image: img4,
    model: "MSYNCAQ948",
    health: 54,
    estimateTime: "16/4/2026",
  },
  {
    title: "Motion Sensor",
    image: img5,
    model: "MSYNCAQ948",
    health: 54,
    estimateTime: "16/4/2026",
  },
  {
    title: "Servo Motor",
    image: img6,
    model: "MSYNCAQ948",
    health: 54,
    estimateTime: "16/4/2026",
  },
  {
    title: "Relay",
    image: img7,
    model: "MSYNCAQ948",
    health: 54,
    estimateTime: "16/4/2026",
  },
  {
    title: "RFID",
    image: img8,
    model: "MSYNCAQ948",
    health: 98,
    estimateTime: "16/4/2026",
  },
  {
    title: "RFID",
    image: img8,
    model: "MSYNCAQ948",
    health: 98,
    estimateTime: "16/4/2026",
  }
]

export default function Health() {

  const [search, setSearch] = useState<string>("");


  return (
    <div className="justify-center items-center text-center text-white">

      <h1 className="my-8 text-xl font-black ">Items Health State</h1>

      <div className="flex justify-center items-center mb-8">
        <Input type="text" placeholder="Search..." className="w-1/2" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-4 justify-center items-center mx-8">

        {
          data.filter((item) => item.title.toLowerCase().includes(search.toLowerCase())).map((item, index) => (
            <ComponentCard
              key={index}
              title={item.title}
              image={item.image}
              model={item.model}
              health={item.health}
              estimateTime={item.estimateTime}
            />
          ))
        }

      </div>

    </div>
  );
};
