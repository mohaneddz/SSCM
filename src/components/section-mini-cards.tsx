import { Card } from "@/components/ui/card";
import { IconTemperature, IconDroplets, IconGauge, IconSun } from "@tabler/icons-react";

const cardStyle = "p-3 bg-[#020818] border-0 shadow-lg relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-[#ffffff10] before:via-[#ffffff05] before:to-transparent before:rounded-lg before:-z-10 before:pointer-events-none backdrop-blur-sm";

const miniCards = [
  {
    title: "Temperature",
    value: "25.5°",
    change: "+2.5°",
    trend: "up",
    icon: IconTemperature,
    color: "#2fb96c"
  },
  {
    title: "Humidity",
    value: "45%",
    change: "-5%",
    trend: "down",
    icon: IconDroplets,
    color: "#465fa4"
  },
  {
    title: "CO2",
    value: "450ppm",
    change: "+50ppm",
    trend: "up",
    icon: IconGauge,
    color: "#972b2b"
  },
  {
    title: "Light",
    value: "850lux",
    change: "-150lux",
    trend: "down",
    icon: IconSun,
    color: "#598d59"
  }
];

export default function SectionMiniCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {miniCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={index}
            className={`${cardStyle} hover:bg-[#172d6640] transition-all duration-300`}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider">
                  {card.title}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#f9f9f9]">
                    {card.value}
                  </span>
                  <span className={`text-sm font-medium ${
                    card.trend === 'up' ? 'text-[#972b2b]' : 'text-[#598d59]'
                  }`}>
                    {card.change}
                  </span>
                </div>
              </div>
              <Icon size={24} className="text-[#b3b3b3]" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}