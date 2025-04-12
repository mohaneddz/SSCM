import { Card } from "@/components/ui/card";
import { IconAirConditioning, IconBulb, IconWindow, IconUsers } from "@tabler/icons-react";

const cardStyle = "p-3 bg-[#020818] border-0 shadow-lg relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-[#ffffff10] before:via-[#ffffff05] before:to-transparent before:rounded-lg before:-z-10 before:pointer-events-none backdrop-blur-sm";

const miniCards = [
  {
    title: "Air Conditioning",
    value: "22°C",
    change: "Cooling",
    trend: "active",
    icon: IconAirConditioning,
    color: "#2fb96c",
    status: "active"
  },
  {
    title: "Light Bulbs",
    value: "3/5",
    change: "60%",
    trend: "on",
    icon: IconBulb,
    color: "#465fa4",
    status: "partial"
  },
  {
    title: "Curtains",
    value: "Closed",
    change: "Auto",
    trend: "closed",
    icon: IconWindow,
    color: "#972b2b",
    status: "closed"
  },
  {
    title: "Workers Inside",
    value: "8",
    change: "Present",
    trend: "present",
    icon: IconUsers,
    color: "#598d59",
    status: "present"
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
                  <span className="text-2xl font-bold dark:text-[#f9f9f9]">
                    {card.value}
                  </span>
                  <span className={`text-sm font-medium ${
                    card.status === 'active' || card.status === 'present' 
                      ? 'text-[#2fb96c]' 
                      : card.status === 'partial'
                      ? 'text-[#465fa4]'
                      : 'text-[#972b2b]'
                  }`}>
                    {card.change}
                  </span>
                </div>
              </div>
              <Icon 
                size={24} 
                className={`${
                  card.status === 'active' || card.status === 'present'
                    ? 'text-[#2fb96c]'
                    : card.status === 'partial'
                    ? 'text-[#465fa4]'
                    : 'text-[#972b2b]'
                }`}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}